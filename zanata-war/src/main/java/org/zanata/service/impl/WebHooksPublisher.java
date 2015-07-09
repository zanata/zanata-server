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

package org.zanata.service.impl;

import javax.annotation.Nonnull;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.jboss.resteasy.client.jaxrs.ResteasyClient;
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;
import org.jboss.resteasy.client.jaxrs.ResteasyWebTarget;
import org.zanata.events.WebhookEventType;

import lombok.extern.slf4j.Slf4j;

/**
 * Do http post for webhook event
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Slf4j
public class WebHooksPublisher {

    private static Response publish(@Nonnull String url,
            @Nonnull String data, @Nonnull MediaType acceptType,
            @Nonnull MediaType mediaType) {
        try {
            ResteasyClient client = new ResteasyClientBuilder().build();
            ResteasyWebTarget target = client.target(url);

            return target.request().accept(acceptType)
                    .post(Entity.entity(data, mediaType));
        } catch (Exception e) {
            log.error("Error on webHooks post {}, {}", url, e);
            return null;
        }
    }

    public static Response publish(@Nonnull String url,
        @Nonnull WebhookEventType event) {
        return publish(url, event.getJSON(), MediaType.APPLICATION_JSON_TYPE,
                MediaType.APPLICATION_JSON_TYPE);
    }
}
