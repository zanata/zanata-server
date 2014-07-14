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

import com.googlecode.totallylazy.collections.PersistentMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.Create;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.annotations.Transactional;
import org.jboss.seam.faces.FacesMessages;
import org.zanata.ApplicationConfiguration;
import org.zanata.email.EmailBuilder;
import org.zanata.email.EmailBuilderStrategy;
import org.zanata.i18n.Messages;
import org.zanata.security.AuthenticationType;
import org.zanata.security.ZanataOpenId;
import org.zanata.service.RegisterService;

import javax.mail.internet.InternetAddress;

import static com.google.common.base.Charsets.UTF_8;

/**
 * This action handles new user profile creation.
 *
 */
@Name("newProfileAction")
@Scope(ScopeType.PAGE)
@Slf4j
public class NewProfileAction extends AbstractProfileAction implements Serializable {
    private static final long serialVersionUID = 1L;

    @In
    private ZanataOpenId zanataOpenId;

    @In
    private EmailBuilder emailBuilder;
    @In
    Messages msgs;

    @In
    RegisterService registerServiceImpl;

    @In
    ApplicationConfiguration applicationConfiguration;

    @Create
    public void onCreate() {
        if (identity.getCredentials().getAuthType() != AuthenticationType.OPENID) {
            // Open id user names are url's so they don't make good defaults
            username = identity.getCredentials().getUsername();
        }
        String domain = applicationConfiguration.getDomainName();
        if (domain == null) {
            email = "";
        } else {
            if (applicationConfiguration.isOpenIdAuth()) {
                email = zanataOpenId.getAuthResult().getEmail();
            } else {
                email = identity.getCredentials().getUsername() + "@" + domain;
            }
        }
    }

    @Transactional
    public void createUser() {
        this.valid = true;
        validateEmail(this.email);
        validateUsername(username);

        if (!this.isValid()) {
            return;
        }

        String key;
        AuthenticationType authType = identity.getCredentials().getAuthType();
        if (authType == AuthenticationType.KERBEROS
                || authType == AuthenticationType.JAAS) {
            key = registerServiceImpl.register(
                    this.username, this.username, this.email);
        } else {
            key = registerServiceImpl.register(this.username, zanataOpenId
                            .getAuthResult().getAuthenticatedId(),
                            AuthenticationType.OPENID, this.name, this.email);
        }
        try {
            InternetAddress to = new InternetAddress(this.email, this.name, UTF_8.name());
            emailBuilder.sendMessage(new EmailActivationEmailStrategy(key), to, null);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        identity.unAuthenticate();
        FacesMessages
                .instance()
                .add(msgs.get("jsf.Account.ActivationMessage"));
    }

    public void cancel() {
        identity.logout();
    }

    @RequiredArgsConstructor
    public static class EmailActivationEmailStrategy extends
            EmailBuilderStrategy {
        private final String key;

        @Override
        public String getSubject(Messages msgs) {
            return msgs.get("jsf.email.activation.Subject");
        }

        @Override
        public String getBodyResourceName() {
            return "org/zanata/email/templates/email_activation.vm";
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
}
