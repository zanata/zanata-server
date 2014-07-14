/*
 * Copyright 2012, Red Hat, Inc. and individual contributors as indicated by the
 * @author tags. See the copyright.txt file in the distribution for a full
 * listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */
package org.zanata.service.impl;

import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.google.common.base.Optional;
import com.googlecode.totallylazy.collections.PersistentMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.security.RunAsOperation;
import org.jboss.seam.security.management.IdentityManager;
import org.owasp.html.PolicyFactory;
import org.zanata.ApplicationConfiguration;
import org.zanata.action.VersionGroupJoinAction;
import org.zanata.dao.PersonDAO;
import org.zanata.email.EmailBuilder;
import org.zanata.email.EmailBuilderStrategy;
import org.zanata.i18n.Messages;
import org.zanata.model.HLocale;
import org.zanata.model.HLocaleMember;
import org.zanata.model.HPerson;
import org.zanata.service.EmailService;
import org.zanata.webtrans.shared.model.ProjectIterationId;

import javax.mail.internet.InternetAddress;

import static com.google.common.base.Charsets.UTF_8;
import static org.owasp.html.Sanitizers.BLOCKS;
import static org.owasp.html.Sanitizers.FORMATTING;
import static org.owasp.html.Sanitizers.IMAGES;
import static org.owasp.html.Sanitizers.LINKS;
import static org.zanata.email.EmailUtil.getAddresses;
import static org.zanata.email.EmailUtil.getReplyTo;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("emailServiceImpl")
@Scope(ScopeType.STATELESS)
@Slf4j
// TODO refactor class to minimise duplicate code
public class EmailServiceImpl implements EmailService {

    // Don't allow CSS styles, scripts, etc
    static final PolicyFactory sanitizer =
            BLOCKS.and(FORMATTING).and(IMAGES).and(LINKS);

    @In
    private EmailBuilder emailBuilder;

    @In
    private IdentityManager identityManager;

    @In
    private PersonDAO personDAO;

    @In
    private ApplicationConfiguration applicationConfiguration;

    @In
    private VersionGroupJoinAction versionGroupJoinAction;

    @In
    private Messages msgs;

    @Override
    public String sendActivationEmail(String toName,
            String toEmailAddr, String activationKey) {
        try {
            InternetAddress to = new InternetAddress(toEmailAddr, toName, UTF_8.name());
            emailBuilder.sendMessage(new ActivationEmailStrategy(activationKey), to,
                    null);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return msgs.get("jsf.Account.ActivationMessage");
    }

    private List<HPerson> getCoordinators(HLocale locale) {
        List<HPerson> coordinators = new ArrayList<HPerson>();

        for (HLocaleMember member : locale.getMembers()) {
            if (member.isCoordinator()) {
                coordinators.add(member.getPerson());
            }
        }
        return coordinators;
    }

    @Override
    public String sendToLanguageCoordinators(HLocale locale,
            EmailBuilderStrategy strategy) {
        List<HPerson> coordinators = getCoordinators(locale);
        if (!coordinators.isEmpty()) {
            String receivedReason =
                    msgs.format(
                            "jsf.email.coordinator.ReceivedReason",
                            locale.retrieveNativeName());

            try {
                emailBuilder.sendMessage(strategy, getAddresses(coordinators),
                        receivedReason);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            return msgs.format("jsf.email.coordinator.SentNotification",
                    locale.retrieveNativeName());
        } else {
            return sendToAdmins(strategy);
        }
    }

    @Override
    public String sendToVersionGroupMaintainers(List<HPerson> maintainers,
            EmailBuilderStrategy strategy) {
        if (!maintainers.isEmpty()) {
            String receivedReason = msgs.format("jsf.email.group.maintainer.ReceivedReason",
                    versionGroupJoinAction.getGroupName());
            try {
                emailBuilder.sendMessage(strategy, getAddresses(maintainers),
                        receivedReason);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            return msgs.format("jsf.email.group.maintainer.SentNotification",
                    versionGroupJoinAction.getGroupName());
        } else {
            return sendToAdmins(strategy);
        }
    }

    @Override
    public String sendToAdmins(EmailBuilderStrategy strategy) {
        List<String> adminEmails = applicationConfiguration.getAdminEmail();
        if (!adminEmails.isEmpty()) {
            String receivedReason = msgs.get("jsf.email.admin.ReceivedReason");
            String toName = msgs.get("jsf.ZanataAdministrator");
            try {
                emailBuilder.sendMessage(strategy, getAddresses(adminEmails, toName),
                        receivedReason);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            return msgs.get("jsf.email.admin.SentNotification");
        } else {
            return sendToAdminUsers(strategy);
        }
    }

    /**
     * Emails admin users with given template
     *
     */
    private String sendToAdminUsers(EmailBuilderStrategy strategy) {
        String receivedReason = msgs.get(
                "jsf.email.admin.user.ReceivedReason");
        try {
            emailBuilder.sendMessage(strategy, getAddresses(getAdmins()),
                    receivedReason);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return msgs.get("jsf.email.admin.SentNotification");
    }

    /**
     *
     * @return a list of admin users
     */
    private List<HPerson> getAdmins() {
        // required to read admin users for a non-admin session
        final List<HPerson> admins = new ArrayList<HPerson>();
        new RunAsOperation() {
            @Override
            public void execute() {
                for (Principal admin : identityManager.listMembers("admin")) {
                    admins.add(personDAO.findByUsername(admin.getName()));
                }
            }
        }.addRole("admin").run();

        return admins;
    }

    @RequiredArgsConstructor
    public static class ActivationEmailStrategy extends EmailBuilderStrategy {
        private final String key;

        @Override
        public String getSubject(Messages msgs) {
            return msgs.get("jsf.email.activation.Subject");
        }

        @Override
        public String getBodyResourceName() {
            return EmailService.ACTIVATION_ACCOUNT_EMAIL_TEMPLATE;
        }

        @Override
        public PersistentMap<String, Object> makeContext(
                PersistentMap<String, Object> genericContext,
                InternetAddress[] toAddresses) {
            PersistentMap<String, Object> context = super.makeContext(genericContext,
                    toAddresses);
            return context
                    .insert("activationKey", key)
                    .insert("toName", toAddresses[0].getPersonal());
        }
    }


    @RequiredArgsConstructor
    public static class ContactAdminEmailStrategy extends EmailBuilderStrategy {
        private final String fromLoginName;
        private final String fromName;
        private final String replyEmail;
        private final String userSubject;
        private final String htmlMessage;

        @Override
        public String getBodyResourceName() {
            return EmailService.ADMIN_EMAIL_TEMPLATE;
        }

        @Override
        public Optional<InternetAddress[]> getReplyToAddress()
                throws UnsupportedEncodingException {
            return Optional.of(getReplyTo(fromName, replyEmail));
        }

        @Override
        public String getSubject(Messages msgs) {
            return msgs.format("jsf.email.admin.SubjectPrefix",
                    fromLoginName) + " " + userSubject;
        }

        @Override
        public PersistentMap<String, Object> makeContext(
                PersistentMap<String, Object> genericContext,
                InternetAddress[] toAddresses) {
            PersistentMap<String, Object> context = super.makeContext(genericContext,
                    toAddresses);
            String safeHTML = sanitizer.sanitize(htmlMessage);
            return context
                    .insert("fromLoginName", fromLoginName)
                    .insert("fromName", fromName)
                    .insert("replyEmail", replyEmail)
                    .insert("htmlMessage", safeHTML);
        }
    }


    @RequiredArgsConstructor
    public static class ContactLanguageCoordinatorEmailStrategy extends EmailBuilderStrategy {
        private final String fromLoginName;
        private final String fromName;
        private final String replyEmail;
        private final String userSubject;
        private final String localeId;
        private final String localeNativeName;
        private final String htmlMessage;

        @Override
        public String getBodyResourceName() {
            return EmailService.COORDINATOR_EMAIL_TEMPLATE;
        }

        @Override
        public Optional<InternetAddress[]> getReplyToAddress()
                throws UnsupportedEncodingException {
            return Optional.of(getReplyTo(fromName, replyEmail));
        }

        @Override
        public String getSubject(Messages msgs) {
            return msgs.format("jsf.email.coordinator.SubjectPrefix",
                    localeId, fromLoginName) + " " + userSubject;
        }

        @Override
        public com.googlecode.totallylazy.collections.PersistentMap<String, Object> makeContext(
                PersistentMap<String, Object> genericContext,
                InternetAddress[] toAddresses) {
            PersistentMap<String, Object> context = super.makeContext(genericContext,
                    toAddresses);
            String safeHTML = sanitizer.sanitize(htmlMessage);
            return context
                    .insert("fromLoginName", fromLoginName)
                    .insert("fromName", fromName)
                    .insert("replyEmail", replyEmail)
                    .insert("localeId", localeId)
                    .insert("localeNativeName", localeNativeName)
                    .insert("htmlMessage", safeHTML);
        }
    }


    @RequiredArgsConstructor
    public static class RequestToJoinLanguageEmailStrategy extends EmailBuilderStrategy {
        private final String fromLoginName;
        private final String fromName;
        private final String replyEmail;
        private final String localeId;
        private final String localeNativeName;
        private final String htmlMessage;
        private final boolean requestAsTranslator;
        private final boolean requestAsReviewer;
        private final boolean requestAsCoordinator;

        @Override
        public String getBodyResourceName() {
            return EmailService.REQUEST_TO_JOIN_EMAIL_TEMPLATE;
        }

        @Override
        public Optional<InternetAddress[]> getReplyToAddress()
                throws UnsupportedEncodingException {
            return Optional.of(getReplyTo(fromName, replyEmail));
        }

        @Override
        public String getSubject(Messages msgs) {
            return msgs.format("jsf.email.joinrequest.Subject",
                    fromLoginName, localeId);
        }

        @Override
        public PersistentMap<String, Object> makeContext(
                PersistentMap<String, Object> genericContext,
                InternetAddress[] toAddresses) {
            PersistentMap<String, Object> context = super.makeContext(genericContext,
                    toAddresses);
            String safeHTML = sanitizer.sanitize(htmlMessage);
            return context
                    .insert("fromLoginName", fromLoginName)
                    .insert("fromName", fromName)
                    .insert("replyEmail", replyEmail)
                    .insert("localeId", localeId)
                    .insert("localeNativeName", localeNativeName)
                    .insert("htmlMessage", safeHTML)
                    .insert("requestAsTranslator", requestAsTranslator)
                    .insert("requestAsReviewer", requestAsReviewer)
                    .insert("requestAsCoordinator", requestAsCoordinator);
        }
    }


    @RequiredArgsConstructor
    public static class RequestRoleLanguageEmailStrategy extends EmailBuilderStrategy {
        private final String fromLoginName;
        private final String fromName;
        private final String replyEmail;
        private final String localeId;
        private final String localeNativeName;
        private final String htmlMessage;
        private final boolean requestAsTranslator;
        private final boolean requestAsReviewer;
        private final boolean requestAsCoordinator;

        @Override
        public String getBodyResourceName() {
            return EmailService.REQUEST_ROLE_EMAIL_TEMPLATE;
        }

        @Override
        public Optional<InternetAddress[]> getReplyToAddress()
                throws UnsupportedEncodingException {
            return Optional.of(getReplyTo(fromName, replyEmail));
        }

        @Override
        public String getSubject(Messages msgs) {
            return msgs.format("jsf.email.rolerequest.Subject",
                    fromLoginName, localeId);
        }

        @Override
        public PersistentMap<String, Object> makeContext(
                PersistentMap<String, Object> genericContext,
                InternetAddress[] toAddresses) {
            PersistentMap<String, Object> context = super.makeContext(genericContext,
                    toAddresses);
            String safeHTML = sanitizer.sanitize(htmlMessage);
            return context
                    .insert("fromLoginName", fromLoginName)
                    .insert("fromName", fromName)
                    .insert("replyEmail", replyEmail)
                    .insert("localeId", localeId)
                    .insert("localeNativeName", localeNativeName)
                    .insert("htmlMessage", safeHTML)
                    .insert("requestAsTranslator", requestAsTranslator)
                    .insert("requestAsReviewer", requestAsReviewer)
                    .insert("requestAsCoordinator", requestAsCoordinator);
        }
    }


    @RequiredArgsConstructor
    public static class RequestToJoinVersionGroupEmailStrategy extends EmailBuilderStrategy {
        private final String fromLoginName;
        private final String fromName;
        private final String replyEmail;
        private final String groupName;
        private final String groupSlug;
        private final Collection<ProjectIterationId> projectIterationIds;
        private final String htmlMessage;

        @Override
        public String getBodyResourceName() {
            return EmailService.REQUEST_TO_JOIN_GROUP_EMAIL_TEMPLATE;
        }

        @Override
        public Optional<InternetAddress[]> getReplyToAddress()
                throws UnsupportedEncodingException {
            return Optional.of(getReplyTo(fromName, replyEmail));
        }

        @Override
        public String getSubject(Messages msgs) {
            return msgs.format("jsf.email.JoinGroupRequest.Subject", groupName);
        }

        @Override
        public PersistentMap<String, Object> makeContext(
                PersistentMap<String, Object> genericContext,
                InternetAddress[] toAddresses) {
            PersistentMap<String, Object> context = super.makeContext(genericContext,
                    toAddresses);
            String safeHTML = sanitizer.sanitize(htmlMessage);
            return context
                    .insert("fromLoginName", fromLoginName)
                    .insert("fromName", fromName)
                    .insert("replyEmail", replyEmail)
                    .insert("groupName", groupName)
                    .insert("versionGroupSlug", groupSlug)
                    .insert("projectIterationIds", projectIterationIds)
                    .insert("htmlMessage", safeHTML);
        }
    }

}
