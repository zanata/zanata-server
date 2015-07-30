/*
 * Copyright 2010, Red Hat, Inc. and individual contributors
 * as indicated by the @author tags. See the copyright.txt file in the
 * distribution for a full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package org.zanata.action;

import java.io.Serializable;
import java.util.Set;

import javax.annotation.Nullable;

import lombok.Getter;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.faces.FacesMessages;
import org.jboss.seam.international.StatusMessage;
import org.jboss.seam.security.management.JpaIdentityStore;
import org.zanata.dao.AccountDAO;
import org.zanata.dao.PersonDAO;
import org.zanata.i18n.Messages;
import org.zanata.model.HAccount;
import org.zanata.model.HLocale;
import org.zanata.model.HPerson;
import org.zanata.rest.editor.dto.User;
import org.zanata.rest.editor.service.UserService;
import org.zanata.security.ZanataIdentity;
import org.zanata.service.GravatarService;

import com.google.common.base.Function;
import com.google.common.base.Joiner;
import com.google.common.base.Strings;
import com.google.common.collect.Collections2;

import static org.apache.commons.lang.StringUtils.abbreviate;

/**
 * User profile page backing bean.
 *
 * @see ProfileAction for edit user profile form page
 * @see NewProfileAction for new user profile form page
 *
 */
@Name("profileHome")
@Scope(ScopeType.PAGE)
@Slf4j
public class ProfileHome implements Serializable {
    private static final long serialVersionUID = 1L;
    @In
    private ZanataIdentity identity;
    @In(required = false, value = JpaIdentityStore.AUTHENTICATED_USER)
    private HAccount authenticatedAccount;
    @In
    private AccountDAO accountDAO;
    @In
    private Messages msgs;
    @In(value = "editor.userService", create = true)
    private UserService userService;

    private String username;

    @Getter
    private User user;

    private void init() {
        HAccount account;
        FacesMessages facesMessages = FacesMessages.instance();
        account = accountDAO.getByUsername(username);
        if (account == null) {
            facesMessages.clear();
            facesMessages.add(StatusMessage.Severity.ERROR,
                    msgs.format("jsf.UsernameNotAvailable", abbreviate(username,
                            24)));
            account = useAuthenticatedAccount();
            if (account == null) {
                // user not logged in and username not found
                return;
            }
        }
        user = userService.generateUser(account);
    }

    private HAccount useAuthenticatedAccount() {
        if (identity.isLoggedIn()) {
            HAccount account;
            username = authenticatedAccount.getUsername();
            account = authenticatedAccount;
            return account;
        }
        return null;
    }

    public String getUsername() {
        if (Strings.isNullOrEmpty(username) && identity.isLoggedIn()) {
            username = authenticatedAccount.getUsername();
            init();
        }
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
        init();
    }
}
