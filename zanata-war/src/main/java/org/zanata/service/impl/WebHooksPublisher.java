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
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.codec.binary.Hex;
import org.jboss.resteasy.client.jaxrs.ResteasyClient;
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;
import org.jboss.resteasy.client.jaxrs.ResteasyWebTarget;
import org.zanata.events.WebhookEventType;

import com.google.common.base.Optional;
import lombok.extern.slf4j.Slf4j;
import sun.misc.BASE64Encoder;

/**
 * Do http post for webhook event
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Slf4j
public class WebHooksPublisher {

    private static final String WEBHOOK_HEADER = "X-Zanata-Webhook";

    private static final String HMAC_SHA1_ALGORITHM = "HmacSHA1";

    private static Response publish(@Nonnull String url,
            @Nonnull String data, @Nonnull MediaType acceptType,
            @Nonnull MediaType mediaType, String serverPath,
            Optional<String> secretKey) {
        try {
            ResteasyClient client = new ResteasyClientBuilder().build();
            ResteasyWebTarget target = client.target(url);

            Invocation.Builder postBuilder =
                    target.request().accept(acceptType);

            if (secretKey.isPresent()) {
                postBuilder.header(WEBHOOK_HEADER,
                        generateHeader(data, secretKey.get(), serverPath));
            }
            
            return postBuilder.post(Entity.entity(data, mediaType));
        } catch (Exception e) {
            log.error("Error on webHooks post {}, {}", url, e);
            return null;
        }
    }

    public static Response publish(@Nonnull String url,
        @Nonnull WebhookEventType event, Optional<String> secretKey,
        @Nonnull String serverPath) {
        return publish(url, event.getJSON(), MediaType.APPLICATION_JSON_TYPE,
                MediaType.APPLICATION_JSON_TYPE, serverPath, secretKey);
    }

    public static String generateHeader(String data, String key, 
            String serverPath) {
        return (calculateHMAC_SHA1(data + serverPath, key));
    }

    public static String calculateHMAC_SHA1(String value, String key) {
        try {
            // Get an hmac_sha1 key from the raw key bytes
            byte[] keyBytes = key.getBytes();
            SecretKeySpec signingKey =
                    new SecretKeySpec(keyBytes, HMAC_SHA1_ALGORITHM);

            // Get an hmac_sha1 Mac instance and initialize with the signing key
            Mac mac = Mac.getInstance(HMAC_SHA1_ALGORITHM);
            mac.init(signingKey);

            // Compute the hmac on input data bytes
            byte[] rawHmac = mac.doFinal(value.getBytes());

            BASE64Encoder encoder = new BASE64Encoder();
            return encoder.encode(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

