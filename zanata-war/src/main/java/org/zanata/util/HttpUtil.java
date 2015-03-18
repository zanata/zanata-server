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
package org.zanata.util;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.HttpMethod;

import org.apache.commons.lang.StringUtils;
import org.jboss.resteasy.spi.HttpRequest;

import com.google.common.collect.Lists;

/**
 * Utility class for HTTP related methods.
 *
 * @author Patrick Huang
 *         <a href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
public final class HttpUtil {
    private final static List<String> HTTP_REQUEST_READ_METHODS = Lists.newArrayList(
        HttpMethod.GET, HttpMethod.HEAD, HttpMethod.OPTIONS);

    public static final String X_AUTH_TOKEN_HEADER = "X-Auth-Token";
    public static final String X_AUTH_USER_HEADER = "X-Auth-User";

    public static final String X_FORWARDED_FOR = "X-Forwarded-For";
    public static final String PROXY_CLIENT_IP = "Proxy-Client-IP";
    public static final String WL_Proxy_Client_IP = "WL-Proxy-Client-IP";
    public static final String HTTP_CLIENT_IP = "HTTP_CLIENT_IP";
    public static final String HTTP_X_FORWARDED_FOR = "HTTP_X_FORWARDED_FOR";

    private static final LinkedList<String> PROXY_HEADERS = Lists
            .newLinkedList((Arrays.asList(X_FORWARDED_FOR, PROXY_CLIENT_IP,
                    WL_Proxy_Client_IP, HTTP_CLIENT_IP, HTTP_X_FORWARDED_FOR)));

    public static String getApiKey(HttpRequest request) {
        return request.getHttpHeaders().getRequestHeaders()
                .getFirst(X_AUTH_TOKEN_HEADER);
    }

    public static String getUserName(HttpRequest request) {
        return request.getHttpHeaders().getRequestHeaders()
                .getFirst(X_AUTH_USER_HEADER);
    }

    /**
     * Return client ip address according to HttpServletRequest.
     *
     * This will also check for the possibility of client behind proxy
     * before returning default remote address in request.
     *
     * NOTE: Not all proxy server include client ip information in http header
     * and different proxy MIGHT use different http header for such information.
     * Default remote address in request will be returned if client information
     * is not found in header.
     *
     * see http://stackoverflow.com.80bola.com/questions/4678797/how-do-i-get-the-remote-address-of-a-client-in-servlet
     * @param request
     */
    public static String getClientIp(HttpServletRequest request) {
        String ip;

        for(String proxyHeader: PROXY_HEADERS) {
            ip = request.getHeader(proxyHeader);
            if(!isIpUnknown(ip)) {
                return ip;
            }
        }
        return request.getRemoteAddr();
    }

    private static boolean isIpUnknown(String ip) {
        return StringUtils.isEmpty(ip) || StringUtils.equalsIgnoreCase(ip,
                "unknown");
    }

    public static boolean isReadMethod(String httpMethod) {
        for(String readMethod: HTTP_REQUEST_READ_METHODS) {
            if(readMethod.equalsIgnoreCase(httpMethod)) {
                return true;
            }
        }
        return false;
    }
}
