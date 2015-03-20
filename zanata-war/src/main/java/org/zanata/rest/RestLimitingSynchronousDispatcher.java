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
package org.zanata.rest;

import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Response;

import org.jboss.resteasy.core.SynchronousDispatcher;
import org.jboss.resteasy.spi.HttpRequest;
import org.jboss.resteasy.spi.HttpResponse;
import org.jboss.resteasy.spi.ResteasyProviderFactory;
import org.jboss.resteasy.spi.UnhandledException;
import org.jboss.seam.resteasy.SeamResteasyProviderFactory;
import org.jboss.seam.security.management.JpaIdentityStore;
import org.jboss.seam.web.ServletContexts;
import org.zanata.exception.InvalidApiKeyException;
import org.zanata.limits.RateLimitingProcessor;
import org.zanata.model.HAccount;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Strings;
import com.google.common.base.Throwables;
import lombok.extern.slf4j.Slf4j;

import org.zanata.security.SecurityFunctions;
import org.zanata.util.HttpUtil;
import org.zanata.util.ServiceLocator;

/**
 * This class extends RESTEasy's SynchronousDispatcher to limit API calls per
 * API key (via RateLimitingProcessor and RateLimitManager) before dispatching
 * requests.
 *
 * @author Patrick Huang <a
 *         href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@Slf4j
class RestLimitingSynchronousDispatcher extends SynchronousDispatcher {
    static final String API_KEY_ABSENCE_WARNING =
            "You must have a valid API key. You can create one by logging in to Zanata and visiting the settings page.";
    private final RateLimitingProcessor processor;

    public RestLimitingSynchronousDispatcher(
            SeamResteasyProviderFactory providerFactory) {
        super(providerFactory);
        processor = new RateLimitingProcessor();
    }

    @VisibleForTesting
    RestLimitingSynchronousDispatcher(ResteasyProviderFactory providerFactory,
            RateLimitingProcessor processor) {
        super(providerFactory);
        this.processor = processor;
    }

    HttpServletRequest getServletRequest() {
        return ServletContexts.instance().getRequest();
    }

    @Override
    public void invoke(final HttpRequest request, final HttpResponse response) {

        //This is for REST request from browser where user is logged in.
        HAccount authenticatedUser = getAuthenticatedUser();

        String apiKey = HttpUtil.getApiKey(request);

        try {
            if (authenticatedUser == null
                    && Strings.isNullOrEmpty(apiKey)
                    && !SecurityFunctions.canAccessRestPath(authenticatedUser,
                            request.getHttpMethod(),
                            request.getPreprocessedPath())) {

                /**
                 * Not using response.sendError because that will allow JBoss to
                 * intercept and generate html page with the message. We want to
                 * return a message string.
                 */
                response.setStatus(Response.Status.UNAUTHORIZED.getStatusCode());
                response.getOutputStream().write(InvalidApiKeyException.getMessage(
                    API_KEY_ABSENCE_WARNING).getBytes());
                return;
            }

            Runnable taskToRun = new Runnable() {

                @Override
                public void run() {
                    RestLimitingSynchronousDispatcher.super.invoke(request,
                            response);
                }
            };

            if (authenticatedUser == null && Strings.isNullOrEmpty(apiKey)) {
                /**
                 *
                 * Process anonymous request for rate limiting
                 * Note: clientIP might be a proxy server IP address, due to
                 * different implementation of each proxy server. This will put
                 * all the requests from same proxy server into a single queue.
                 *
                 */
                String clientIP = HttpUtil.getClientIp(getServletRequest());
                processor.processClientIp(clientIP, response, taskToRun);
            } else if (authenticatedUser == null) {
                // we are not validating api key but will rate limit any api key
                processor.processApiKey(apiKey, response, taskToRun);
            } else if (!Strings.isNullOrEmpty(authenticatedUser.getApiKey())) {
                processor.processApiKey(authenticatedUser.getApiKey(),
                        response, taskToRun);
            } else {
                processor.processUsername(authenticatedUser.getUsername(),
                        response, taskToRun);
            }

        } catch (UnhandledException e) {
            Throwable cause = e.getCause();
            log.error("Failed to process REST request", cause);
            try {
                // see https://issues.jboss.org/browse/RESTEASY-411
                if (cause instanceof IllegalArgumentException
                        && cause.getMessage().contains(
                                "Failure parsing MediaType")) {
                    response.sendError(Response.Status.UNSUPPORTED_MEDIA_TYPE
                            .getStatusCode(), cause.getMessage());
                } else {
                    response.sendError(Response.Status.INTERNAL_SERVER_ERROR
                            .getStatusCode(), "Error processing Request");
                }

            } catch (IOException ioe) {
                log.error("Failed to send error on failed REST request", ioe);
            }
        } catch (Exception e) {
            log.error("error processing request", e);
            throw Throwables.propagate(e);
        }
    }

    @VisibleForTesting
    protected HAccount getAuthenticatedUser() {
        return ServiceLocator.instance().getInstance(
                JpaIdentityStore.AUTHENTICATED_USER, HAccount.class);
    }
}
