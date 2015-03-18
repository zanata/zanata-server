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

import lombok.Getter;
import lombok.Setter;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.security.management.JpaIdentityStore;
import org.zanata.common.LocaleId;
import org.zanata.dao.LocaleMemberDAO;
import org.zanata.i18n.Messages;
import org.zanata.model.HAccount;
import org.zanata.model.HLocaleMember;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */

@AutoCreate
@Name("languageJoinAction")
@Scope(ScopeType.PAGE)
public class LanguageJoinAction implements Serializable {
    private static final long serialVersionUID = 1L;

    private static final String EMAIL_TYPE_REQUEST_JOIN =
        "request_join_language";

    @In
    private Messages msgs;

    @In
    private LocaleMemberDAO localeMemberDAO;

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

    @In(value = JpaIdentityStore.AUTHENTICATED_USER, required = false)
    private HAccount authenticatedAccount;

    public String getEmailType() {
        return EMAIL_TYPE_REQUEST_JOIN;
    }

    public boolean hasSelectedRole() {
        return requestAsTranslator || requestAsReviewer || requestAsCoordinator;
    }

    public void bindRole(String role, boolean checked) {
        if(role.equals("translator")) {
            requestAsTranslator = checked;
        } else if(role.equals("reviewer")) {
            requestAsReviewer = checked;
        } else if(role.equals("coordinator")) {
            requestAsCoordinator = checked;
        }
    }

    public String getSubject() {
        return msgs.format("jsf.language.email.joinrequest.Subject",
            getLoginName(), getLocaleId().getId());
    }

    private String getLoginName() {
        if(authenticatedAccount != null) {
            return authenticatedAccount.getUsername();
        }
        return "";
    }

    private LocaleId getLocaleId() {
        return new LocaleId(language);
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
