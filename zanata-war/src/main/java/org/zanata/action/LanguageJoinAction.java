/*
 * Copyright 2013, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata.action;

import java.io.Serializable;
import java.util.List;

import com.google.common.base.Joiner;
import com.google.common.collect.Lists;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.annotations.Transactional;
import org.zanata.events.JoinedLanguageTeam;
import org.zanata.exception.RequestExistException;
import org.zanata.security.annotations.CheckLoggedIn;
import org.zanata.seam.security.ZanataJpaIdentityStore;
import org.zanata.common.LocaleId;
import org.zanata.dao.LocaleMemberDAO;
import org.zanata.email.EmailStrategy;
import org.zanata.email.RequestToJoinLanguageEmailStrategy;
import org.zanata.i18n.Messages;
import org.zanata.model.HAccount;
import org.zanata.model.HLocale;
import org.zanata.model.HLocaleMember;
import org.zanata.security.annotations.ZanataSecured;
import org.zanata.service.EmailService;
import org.zanata.service.LocaleService;
import org.zanata.service.RequestService;
import org.zanata.ui.faces.FacesMessages;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */

@AutoCreate
@Name("languageJoinAction")
@Scope(ScopeType.PAGE)
@ZanataSecured
@Slf4j
public class LanguageJoinAction implements Serializable {
    private static final long serialVersionUID = 1L;

    @In
    private LocaleMemberDAO localeMemberDAO;

    @In
    private LocaleService localeServiceImpl;

    @In
    private EmailService emailServiceImpl;

    @In("jsfMessages")
    private FacesMessages facesMessages;

    @In
    private Messages msgs;

    @Getter
    @Setter
    private boolean requestAsTranslator;

    @Getter
    @Setter
    private boolean requestAsReviewer;

    @Getter
    @Setter
    private boolean requestAsCoordinator;

    @Setter
    @Getter
    private String language;

    private HLocale locale;

    @Getter
    @Setter
    private String message;

    @In
    private RequestService requestServiceImpl;

    @In(value = ZanataJpaIdentityStore.AUTHENTICATED_USER, required = false)
    private HAccount authenticatedAccount;

    public boolean hasSelectedRole() {
        return requestAsTranslator || requestAsReviewer || requestAsCoordinator;
    }

    public void bindRole(String role, boolean checked) {
        if (role.equals("translator")) {
            requestAsTranslator = checked;
        } else if (role.equals("reviewer")) {
            requestAsReviewer = checked;
        } else if (role.equals("coordinator")) {
            requestAsCoordinator = checked;
        }
    }

    private void reset() {
        requestAsTranslator = false;
        requestAsReviewer = false;
        requestAsCoordinator = false;
    }

    @CheckLoggedIn
    public void createRequest() {
        try {
            requestServiceImpl
                    .createLanguageRequest(authenticatedAccount, getLocale(),
                        isRequestAsTranslator(),
                        isRequestAsReviewer(),
                        isRequestAsCoordinator());
            sendEmail(isRequestAsCoordinator(), isRequestAsReviewer(),
                isRequestAsTranslator());
        } catch (RequestExistException e) {
            log.warn("Request already exist for {0} in language {1}.",
                    authenticatedAccount.getUsername(), getLocale().getDisplayName());
        }
    }

    @CheckLoggedIn
    public void requestAsTranslator() {
        try {
            requestServiceImpl
                .createLanguageRequest(authenticatedAccount, getLocale(), true,
                    false, false);
            sendEmail(false, false, true);
        } catch (RequestExistException e) {
            log.warn("Request already exist for {0} in language {1}.",
                authenticatedAccount.getUsername(), locale.getDisplayName());
        }
    }

    @CheckLoggedIn
    public void requestAsReviewer() {
        try {
            requestServiceImpl
                .createLanguageRequest(authenticatedAccount, getLocale(), false,
                    true, false);
            sendEmail(false, true, false);
        } catch (RequestExistException e) {
            log.warn("Request already exist for {0} in language {1}.",
                authenticatedAccount.getUsername(), getLocale().getDisplayName());
        }
    }

    @CheckLoggedIn
    public void requestAsCoordinator() {
        try {
            requestServiceImpl
                .createLanguageRequest(authenticatedAccount, getLocale(), false,
                    false, true);
            sendEmail(false, false, true);
        } catch (RequestExistException e) {
            log.warn("Request already exist for {0} in language {1}.",
                authenticatedAccount.getUsername(), getLocale().getDisplayName());
        }
    }

    @CheckLoggedIn
    public void sendEmail(boolean isRequestAsCoordinator,
        boolean isRequestAsReviewer, boolean isRequestAsTranslator) {
        String fromName = authenticatedAccount.getPerson().getName();
        String fromLoginName = authenticatedAccount.getUsername();
        String replyEmail = authenticatedAccount.getPerson().getEmail();

        EmailStrategy strategy =
            new RequestToJoinLanguageEmailStrategy(
                fromLoginName, fromName, replyEmail,
                getLocale().getLocaleId().getId(),
                getLocale().retrieveNativeName(),
                isRequestAsTranslator,
                isRequestAsReviewer,
                isRequestAsCoordinator);
        try {
            facesMessages.addGlobal(emailServiceImpl
                .sendToLanguageCoordinators(locale.getLocaleId(), strategy));
        } catch (Exception e) {
            String subject = strategy.getSubject(msgs);

            StringBuilder sb =
                new StringBuilder()
                    .append("Failed to send email with subject '")
                    .append(strategy.getSubject(msgs))
                    .append("'");
            log.error(
                "Failed to send email: fromName '{}', fromLoginName '{}', replyEmail '{}', subject '{}'. {}",
                fromName, fromLoginName, replyEmail, subject, e);
            facesMessages.addGlobal(sb.toString());
        } finally {
            reset();
        }
    }

    public boolean isUserAlreadyRequest() {
        return requestServiceImpl.isRequestExist(authenticatedAccount, getLocale());
    }

    public void cancelRequest() {
        requestServiceImpl.cancelRequest(authenticatedAccount, locale);
        facesMessages.addGlobal(msgs.format("jsf.language.request.cancelled",
            authenticatedAccount.getUsername()));
    }

    public String getMyRoles() {
        if(authenticatedAccount == null) {
            return "";
        }
        HLocaleMember localeMember = getLocaleMember();
        if(localeMember == null) {
            return "";
        }

        List<String> roles = Lists.newArrayList();
        if(localeMember.isTranslator()) {
            roles.add("Translator");
        }

        if(localeMember.isReviewer()) {
            roles.add("Reviewer");
        }

        if(localeMember.isCoordinator()) {
            roles.add("Coordinator");
        }
        return msgs.format("jsf.language.myRoles", Joiner.on(",").join(roles));
    }


    public HLocale getLocale() {
        /*
         * Preload the HLocaleMember objects. This line is needed as Hibernate
         * has problems when invoking lazily loaded collections from postLoad
         * entity listener methods. In this case, the drools engine will attempt
         * to access the 'members' collection from inside the security
         * listener's postLoad method to evaluate rules.
         */
        if (locale == null) {
            locale = localeServiceImpl.getByLocaleId(new LocaleId(language));
            locale.getMembers();
        }
        return locale;
    }

    public boolean isTranslator() {
        HLocaleMember member = getLocaleMember();
        return member == null ? false : getLocaleMember().isTranslator();
    }

    public boolean isReviewer() {
        HLocaleMember member = getLocaleMember();
        return member == null ? false : getLocaleMember().isReviewer();
    }

    public boolean isCoordinator() {
        HLocaleMember member = getLocaleMember();
        return member == null ? false : getLocaleMember().isCoordinator();
    }

    private HLocaleMember getLocaleMember() {
        return localeMemberDAO.findByPersonAndLocale(authenticatedAccount
                .getPerson().getId(), new LocaleId(language));
    }
}
