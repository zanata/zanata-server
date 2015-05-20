/*
 * Copyright 2015, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata.email;

import javax.mail.internet.InternetAddress;

import lombok.RequiredArgsConstructor;

import org.zanata.i18n.Messages;

import com.google.common.base.Optional;
import com.googlecode.totallylazy.collections.PersistentMap;
import org.zanata.util.HtmlUtil;


@RequiredArgsConstructor
public class ContactAdminAnonymousEmailStrategy extends EmailStrategy {
    private final String ipAddress;
    private final String userSubject;
    private final String htmlMessage;

    @Override
    public String getBodyResourceName() {
        return "org/zanata/email/templates/email_admin_anonymous.vm";
    }

    @Override
    public Optional<InternetAddress[]> getReplyToAddress() {
        return Optional.absent();
    }

    @Override
    public String getSubject(Messages msgs) {
        return msgs.format("jsf.email.admin.SubjectPrefix",
            ipAddress) + " " + userSubject;
    }

    @Override
    public PersistentMap<String, Object> makeContext(
            PersistentMap<String, Object> genericContext,
            InternetAddress[] toAddresses) {
        PersistentMap<String, Object> context = super.makeContext(
                genericContext, toAddresses);
        String safeHTML = HtmlUtil.SANITIZER.sanitize(htmlMessage);
        return context
                .insert("ipAddress", ipAddress)
                .insert("htmlMessage", safeHTML);
    }
}
