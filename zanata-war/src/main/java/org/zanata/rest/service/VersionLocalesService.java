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
package org.zanata.rest.service;

import java.lang.reflect.Type;
import java.util.List;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;

import org.jboss.resteasy.util.GenericType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.dao.ProjectIterationDAO;
import org.zanata.model.HLocale;
import org.zanata.model.HProjectIteration;
import org.zanata.rest.dto.Locale;
import org.zanata.service.LocaleService;

import com.google.common.collect.Lists;

@Name("versionLocalesService")
@Path(VersionLocalesResource.SERVICE_PATH)
@Transactional
public class VersionLocalesService implements VersionLocalesResource {

    @PathParam("projectSlug")
    private String projectSlug;

    @PathParam("versionSlug")
    private String versionSlug;

    @In
    private LocaleService localeServiceImpl;

    @In
    private ProjectIterationDAO projectIterationDAO;

    @Override
    public Response get() {
        HProjectIteration version =
                projectIterationDAO.getBySlug(projectSlug, versionSlug);
        if (version == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        List<HLocale> locales =
                localeServiceImpl.getSupportedLanguageByProjectIteration(
                        projectSlug, versionSlug);

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
}
