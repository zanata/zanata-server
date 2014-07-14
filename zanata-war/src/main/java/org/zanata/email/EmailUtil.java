/*
 * Copyright 2014, Red Hat, Inc. and individual contributors
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
package org.zanata.email;

import static com.google.common.base.Charsets.UTF_8;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import javax.mail.internet.InternetAddress;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import org.zanata.model.HPerson;

/**
 * Helper methods for working with JavaMail addresses.
 * @author Sean Flanigan <a href="mailto:sflaniga@redhat.com">sflaniga@redhat.com</a>
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class EmailUtil {
    public static InternetAddress toAddress(HPerson person)
            throws UnsupportedEncodingException {
        return new InternetAddress(person.getEmail(), person.getName(), UTF_8.name());
    }
    public static InternetAddress[] getAddresses(List<HPerson> personList)
            throws UnsupportedEncodingException {
        List<InternetAddress> toAddresses = new ArrayList<InternetAddress>();
        for (HPerson coord : personList) {
            toAddresses.add(new InternetAddress(coord.getEmail(),
                    coord.getName(), UTF_8.name()));
        }
        return toAddresses.toArray(new InternetAddress[toAddresses.size()]);
    }

    public static InternetAddress[] getAddresses(List<String> emailList, String name)
            throws UnsupportedEncodingException {
        List<InternetAddress> toAddresses = new ArrayList<InternetAddress>();
        for (String email : emailList) {
            toAddresses.add(new InternetAddress(email,
                    name, UTF_8.name()));
        }
        return toAddresses.toArray(new InternetAddress[toAddresses.size()]);
    }

    public static InternetAddress[] getReplyTo(String email, String name)
            throws UnsupportedEncodingException {
        return new InternetAddress[] {new InternetAddress(email,
                name, UTF_8.name())};
    }

}
