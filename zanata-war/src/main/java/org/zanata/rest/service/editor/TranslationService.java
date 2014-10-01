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
package org.zanata.rest.service.editor;

import java.util.List;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;

import org.apache.commons.lang.StringUtils;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.common.ContentState;
import org.zanata.common.LocaleId;
import org.zanata.dao.LocaleDAO;
import org.zanata.dao.TextFlowDAO;
import org.zanata.dao.TextFlowTargetDAO;
import org.zanata.model.HLocale;
import org.zanata.model.HTextFlow;
import org.zanata.model.HTextFlowTarget;
import org.zanata.rest.dto.resource.TransUnit;
import org.zanata.rest.dto.resource.TransUnits;
import org.zanata.rest.dto.resource.TranslationData;
import org.zanata.security.ZanataIdentity;
import org.zanata.security.permission.PermissionEvaluator;
import org.zanata.service.SecurityService;
import org.zanata.service.TranslationService.TranslationResult;
import org.zanata.service.impl.TranslationServiceImpl;
import org.zanata.webtrans.shared.model.TransUnitId;
import org.zanata.webtrans.shared.model.TransUnitUpdateRequest;

import com.google.common.collect.Lists;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("editor.translationService")
@Path(TranslationResource.SERVICE_PATH)
@Transactional
public class TranslationService implements TranslationResource {
    @In
    private ZanataIdentity identity;

    @In
    private TextFlowTargetDAO textFlowTargetDAO;

    @In
    private TextFlowDAO textFlowDAO;

    @In
    private LocaleDAO localeDAO;

    @In
    private TransUnitUtils transUnitUtils;

    @In
    private org.zanata.service.TranslationService translationServiceImpl;

    @Override
    public Response get(String localeId, String ids) {
        TransUnits transUnits = new TransUnits();
        if (StringUtils.isEmpty(ids)) {
            return Response.ok(transUnits).build();
        }
        List<Long> idList = TransUnitUtils.filterAndConvertIdsToList(ids);
        if (idList.size() > TransUnitUtils.MAX_SIZE) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        LocaleId locale = new LocaleId(localeId);

        for (Long id : idList) {
            HTextFlowTarget hTarget =
                    textFlowTargetDAO.getTextFlowTarget(id, locale);
            if (hTarget != null) {
                TransUnit tu =
                        transUnitUtils.buildTransUnit(hTarget, locale, false,
                                true);
                transUnits.addTransUnit(hTarget.getTextFlow().getId()
                        .toString(), tu);
            }
        }
        return Response.ok(transUnits).build();
    }

    @Override
    public Response put(String localeId, TranslationData data) {
        TranslationData requestData = data;
        HLocale locale = localeDAO.findByLocaleId(new LocaleId(localeId));
        HTextFlow textFlow =
                textFlowDAO.findById(requestData.getId().longValue());

        if (textFlow == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        identity.checkPermission("modify-translation",
                textFlow.getDocument().getProjectIteration().getProject(),
                locale);

        // //Only support 1 translation update for the moment
        TransUnitUpdateRequest request =
                new TransUnitUpdateRequest(new TransUnitId(requestData.getId()
                        .longValue()), requestData.getContents(),
                        requestData.getStatus(), requestData.getRevision());

        List<TranslationResult> translationResults =
                translationServiceImpl.translate(new LocaleId(localeId),
                        Lists.newArrayList(request));

        TranslationResult result = translationResults.get(0);

        if (result.isVersionNumConflict()) {
            return Response.status(Response.Status.CONFLICT).build();
        } else if (!result.isTranslationSuccessful()) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .build();
        } else {
            requestData.setStatus(result.getTranslatedTextFlowTarget()
                    .getState());
            requestData.setRevision(result.getTranslatedTextFlowTarget()
                    .getVersionNum());
            return Response.ok(requestData).build();
        }
    }
}
