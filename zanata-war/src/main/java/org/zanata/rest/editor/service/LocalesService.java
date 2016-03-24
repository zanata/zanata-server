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
package org.zanata.rest.editor.service;

import java.lang.reflect.Type;
import java.util.List;
import java.util.StringTokenizer;

import javax.enterprise.context.RequestScoped;
import javax.enterprise.event.Event;
import javax.ws.rs.Path;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;

import org.jboss.resteasy.util.GenericType;
import javax.inject.Inject;
import javax.inject.Named;
import org.apache.deltaspike.jpa.api.transaction.Transactional;
import org.zanata.common.LocaleId;
import org.zanata.events.LocaleSelectedEvent;
import org.zanata.model.HLocale;
import org.zanata.rest.editor.dto.Locale;
import org.zanata.rest.editor.service.resource.LocalesResource;
import org.zanata.service.LocaleService;

import com.google.common.base.Function;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@RequestScoped
@Named("editor.localesService")
@Path(LocalesResource.SERVICE_PATH)
@Transactional
public class LocalesService implements LocalesResource {

    @Inject
    private LocaleService localeServiceImpl;

    @Inject
    private Event<LocaleSelectedEvent> localeSelectedEvent;

    @Override
    public Response get() {
        List<HLocale> locales = localeServiceImpl.getAllLocales();

        List<Locale> localesRefs =
            Lists.newArrayListWithExpectedSize(locales.size());

        for (HLocale hLocale : locales) {
            localesRefs.add(new Locale(hLocale.getLocaleId(),
                hLocale.retrieveDisplayName()));
        }

        Type genericType = new GenericType<List<Locale>>() {
        }.getGenericType();
        Object entity =
            new GenericEntity<List<Locale>>(localesRefs, genericType);
        return Response.ok(entity).build();
    }

    @Override
    public Response getUILocales() {
        List<Locale> results =
            Lists.transform(getSupportedLocales(),
                new Function<java.util.Locale, Locale>() {
                    @Override
                    public Locale apply(java.util.Locale locale) {
                        return new Locale(LocaleId.fromJavaName(locale.toString()),
                            locale.getDisplayName());
                    }
                });

        Type genericType = new GenericType<List<Locale>>() {
        }.getGenericType();
        Object entity =
            new GenericEntity<List<Locale>>(results, genericType);
        return Response.ok(entity).build();
    }

    @Override
    public Response updateUiLocale(String localeId) {
        /**
         * Force the resource bundle to reload, using the current locale,
         * and raise the org.zanata.events.LocaleSelectedEvent event.
         */
        java.util.Locale locale = transformToLocale(localeId);

        localeSelectedEvent.fire(new LocaleSelectedEvent(locale));
        return Response.ok(new LocaleId(localeId)).build();
    }

    private java.util.Locale transformToLocale(String localeId) {
        StringTokenizer tokens = new StringTokenizer(localeId, "-_");
        String language = tokens.hasMoreTokens() ? tokens.nextToken() : null;
        String country =  tokens.hasMoreTokens() ? tokens.nextToken() : null;
        String variant =  tokens.hasMoreTokens() ? tokens.nextToken() : null;

        if (!Strings.isNullOrEmpty(variant)) {
            return new java.util.Locale(language, country, variant);
        } else if (!Strings.isNullOrEmpty(country)) {
            return new java.util.Locale(language, country);
        } else if (!Strings.isNullOrEmpty(language)) {
            return new java.util.Locale(language);
        } else {
            return new java.util.Locale(localeId);
        }
    }

    /**
     * Returns list of locales that are enabled for Zanata UI translation.
     * This to to be sync with locale-config#faces-config.xml
     */
    private List<java.util.Locale> getSupportedLocales() {
        List<java.util.Locale> locales = Lists.newArrayList();
        locales.add(java.util.Locale.ENGLISH);
        locales.add(new java.util.Locale("uk"));
        locales.add(java.util.Locale.TAIWAN);
        locales.add(java.util.Locale.JAPANESE);
        locales.add(new java.util.Locale("hu"));
        locales.add(new java.util.Locale("br"));
        locales.add(new java.util.Locale("cs"));
        locales.add(java.util.Locale.ITALIAN);
        locales.add(new java.util.Locale("pt_BR"));
        locales.add(java.util.Locale.FRENCH);
        return locales;
    }
}
