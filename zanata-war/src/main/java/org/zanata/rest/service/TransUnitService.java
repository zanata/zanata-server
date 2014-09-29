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
import org.zanata.common.LocaleId;
import org.zanata.dao.DocumentDAO;
import org.zanata.dao.LocaleDAO;
import org.zanata.dao.ProjectIterationDAO;
import org.zanata.dao.TextFlowTargetDAO;
import org.zanata.model.HDocument;
import org.zanata.model.HLocale;
import org.zanata.model.HProjectIteration;
import org.zanata.model.HTextFlow;
import org.zanata.model.HTextFlowTarget;
import org.zanata.rest.dto.Locale;
import org.zanata.rest.dto.TransUnitStatus;
import org.zanata.service.LocaleService;

import com.google.common.collect.Lists;

@Name("transUnitStatusService")
@Path(TransUnitResource.SERVICE_PATH)
@Transactional
public class TransUnitService implements TransUnitResource {

    @PathParam("projectSlug")
    private String projectSlug;

    @PathParam("versionSlug")
    private String versionSlug;

    @PathParam("docId")
    private String docId;

    @PathParam("localeId")
    private String localeId;

    @In
    private TextFlowTargetDAO textFlowTargetDAO;

    @In
    private DocumentDAO documentDAO;

    @In
    private LocaleDAO localeDAO;

    @Override
    public Response getStatus() {

        HDocument document =
                documentDAO.getByProjectIterationAndDocId(projectSlug,
                        versionSlug, docId);

        if (document == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        HLocale hLocale = localeDAO.findByLocaleId(new LocaleId(localeId));
        if (hLocale == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        List<HTextFlowTarget> translations =
                textFlowTargetDAO.findTranslations(document, hLocale);

        List<TransUnitStatus> statusList =
                Lists.newArrayListWithExpectedSize(translations.size());

        for (HTextFlowTarget target : translations) {
            statusList.add(new TransUnitStatus(target
                    .getTextFlow().getId(), target
                    .getTextFlow().getResId(), target.getState()));
        }

        Type genericType = new GenericType<List<Locale>>() {
        }.getGenericType();
        Object entity =
                new GenericEntity<List<TransUnitStatus>>(statusList,
                        genericType);
        return Response.ok(entity).build();
    }
}
