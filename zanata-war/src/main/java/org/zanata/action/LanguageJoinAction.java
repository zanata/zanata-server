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
import org.zanata.exception.RequestExistException;
import org.zanata.model.LanguageRequest;
import org.zanata.model.type.RequestState;
import org.zanata.security.ZanataIdentity;
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
import org.zanata.service.LanguageTeamService;
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

    @Setter
    @Getter
    private String language;

    private HLocale locale;

    @Getter
    @Setter
    private String message;

    @In
    private RequestService requestServiceImpl;

    @In
    private ZanataIdentity identity;

    @In
    private LanguageTeamService languageTeamServiceImpl;

    @In(value = ZanataJpaIdentityStore.AUTHENTICATED_USER, required = false)
    private HAccount authenticatedAccount;

    public String getMyRequestedRole() {
        LanguageRequest request =
                requestServiceImpl.getPendingLanguageRequests(
                        authenticatedAccount,
                        getLocale().getLocaleId());
        return getRequestedRole(request);
    }

    public String getRequestedRole(LanguageRequest request) {
        return Joiner.on(", ")
            .skipNulls()
            .join(request.getCoordinator() ? "Coordinator" : null,
                request.getReviewer() ? "Reviewer" : null,
                request.getTranslator() ? "Translator" : null);
    }

    public void acceptRequest(Long languageRequestId) {
        identity.checkPermission(getLocale(), "manage-language-team");
        LanguageRequest request =
                requestServiceImpl.getLanguageRequest(languageRequestId);

        languageTeamServiceImpl.joinOrUpdateRoleInLanguageTeam(
                language, request.getRequest().getRequester().getId(),
                request.getTranslator(), request.getReviewer(),
                request.getCoordinator());

        requestServiceImpl.updateLanguageRequest(languageRequestId,
                authenticatedAccount, RequestState.ACCEPTED, "");
        facesMessages.addGlobal(msgs.get("jsf.language.request.updated"));
    }

    public void declineRequest(Long languageRequestId, String comment) {
        identity.checkPermission(locale, "manage-language-team");
        requestServiceImpl.updateLanguageRequest(languageRequestId,
            authenticatedAccount, RequestState.REJECTED, comment);
        facesMessages.addGlobal(msgs.get("jsf.language.request.updated"));
    }

    @CheckLoggedIn
    public void requestAsTranslator() {
        processRequest(true, false, false);
    }

    @CheckLoggedIn
    public void requestAsReviewer() {
        processRequest(false, true, false);
    }

    @CheckLoggedIn
    public void requestAsCoordinator() {
        processRequest(false, false, true);
    }

    private void processRequest(boolean isRequestAsTranslator,
            boolean isRequestAsReviewer,
            boolean isRequestAsCoordinator) {
        try {
            requestServiceImpl
                    .createLanguageRequest(authenticatedAccount, getLocale(),
                            isRequestAsCoordinator,
                            isRequestAsReviewer, isRequestAsTranslator);
            sendRequestEmail(isRequestAsCoordinator, isRequestAsReviewer,
                isRequestAsTranslator);
        } catch (RequestExistException e) {
            log.warn("Request already exist for {0} in language {1}.",
                    authenticatedAccount.getUsername(), getLocale()
                            .getDisplayName());
        }
    }

    private void sendRequestEmail(boolean isRequestAsCoordinator,
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
        }
    }

    public boolean isUserAlreadyRequest() {
        return requestServiceImpl.isLanguageRequestExist(authenticatedAccount,
            getLocale());
    }

    public void cancelRequest() {
        LanguageRequest languageRequest =
                requestServiceImpl.getPendingLanguageRequests(
                        authenticatedAccount,
                        getLocale().getLocaleId());
        String comment =
                "Request cancelled by requester {"
                        + authenticatedAccount.getUsername() + "}";
        requestServiceImpl.updateLanguageRequest(languageRequest.getId(),
                authenticatedAccount, RequestState.CANCELLED, comment);

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
