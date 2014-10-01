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
import javax.ws.rs.core.Response;

import org.apache.commons.lang.StringUtils;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.common.LocaleId;
import org.zanata.dao.TextFlowDAO;
import org.zanata.dao.TextFlowTargetDAO;
import org.zanata.model.HTextFlow;
import org.zanata.model.HTextFlowTarget;
import org.zanata.rest.dto.resource.TextFlow;
import org.zanata.rest.dto.resource.TextFlowTarget;
import org.zanata.rest.dto.resource.TransUnit;
import org.zanata.rest.dto.resource.TransUnits;
import org.zanata.rest.service.ResourceUtils;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("translationService")
@Path(TranslationResource.SERVICE_PATH)
@Transactional
public class TranslationService implements TranslationResource {
    public static int MAX_ID_SIZE = 200;

    @In
    private TextFlowTargetDAO textFlowTargetDAO;

    @In
    private ResourceUtils resourceUtils;

    @Override
    public Response get(String localeId, String ids) {
        TransUnits transUnits = new TransUnits();
        if (StringUtils.isEmpty(ids)) {
            return Response.ok(transUnits).build();
        }
        List<String> idList = Lists.newArrayList(ids.split(","));
        if (idList.size() > MAX_ID_SIZE) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        LocaleId locale = new LocaleId(localeId);

        for(String id: idList) {
            if(StringUtils.isNumeric(id)) {
                HTextFlowTarget hTarget = textFlowTargetDAO.getTextFlowTarget(
                        Long.parseLong(id), locale);
                if(hTarget != null) {
                    HTextFlow htf = hTarget.getTextFlow();
                    TextFlow tf = new TextFlow(htf.getResId(), locale);
                    resourceUtils.transferToTextFlow(htf, tf);

                    TextFlowTarget target = new TextFlowTarget(htf.getResId());
                    resourceUtils.transferToTextFlowTarget(hTarget, target,
                            Optional.<String>absent());

                    TransUnit tu = new TransUnit();
                    tu.addTarget(locale, target);
                    transUnits.addTransUnit(htf.getId().toString(), tu);
                }
            }
        }
        return Response.ok(transUnits).build();
    }
}
