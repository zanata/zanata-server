/*
 * Copyright 2014, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata.security.openid;

/**
 * General utilities for Open Id providers.
 *
 * @author Carlos Munoz <a
 *         href="mailto:camunoz@redhat.com">camunoz@redhat.com</a>
 */
public class OpenIdUtil {

    /**
     * Returns the best suited provider for a given Open id.
     *
     * @param openId
     *            An Open id (They are usually in the form of a url).
     */
    public static OpenIdProviderType getBestSuitedProvider(String openId) {
        if (new FedoraOpenIdProvider().accepts(openId)) {
            return OpenIdProviderType.Fedora;
        } else if (new GoogleOpenIdProvider().accepts(openId)) {
            return OpenIdProviderType.Google;
        } else if (new YahooOpenIdProvider().accepts(openId)) {
            return OpenIdProviderType.Yahoo;
        } else {
            return OpenIdProviderType.Generic;
        }
    }
}
