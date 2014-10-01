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

import java.lang.reflect.Type;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nullable;
import javax.ws.rs.Path;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;

import org.apache.commons.lang.StringUtils;
import org.jboss.resteasy.util.GenericType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.common.LocaleId;
import org.zanata.dao.TextFlowDAO;
import org.zanata.model.HLocale;
import org.zanata.model.HTextFlow;
import org.zanata.rest.dto.Locale;
import org.zanata.rest.dto.resource.TextFlow;
import org.zanata.rest.dto.resource.TransUnit;
import org.zanata.rest.dto.resource.TransUnits;
import org.zanata.rest.service.ResourceUtils;
import org.zanata.service.LocaleService;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
import com.google.common.collect.FluentIterable;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("sourceService")
@Path(SourceResource.SERVICE_PATH)
@Transactional
public class SourceService implements SourceResource {
    public static int MAX_ID_SIZE = 200;

    @In
    private TextFlowDAO textFlowDAO;

    @In
    private ResourceUtils resourceUtils;

    @Override
    public Response get(String ids) {
        TransUnits transUnits = new TransUnits();
        if (StringUtils.isEmpty(ids)) {
            return Response.ok(transUnits).build();
        }
        List<String> idList = Lists.newArrayList(ids.split(","));
        if (idList.size() > MAX_ID_SIZE) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        List<Long> filteredIds = Lists.newArrayList();
        for(String id: idList) {
            if(isNumeric(id)) {
                filteredIds.add(Long.parseLong(id));
            }
        }

        List<HTextFlow> hTextFlows = textFlowDAO.findByIdList(filteredIds);

        for(HTextFlow htf: hTextFlows) {
            LocaleId localeId = htf.getDocument().getLocale().getLocaleId();
            TextFlow tf = new TextFlow(htf.getResId(), localeId);
            resourceUtils.transferToTextFlow(htf, tf);
            transUnits.addTransUnit(htf.getId().toString(), new TransUnit(tf));
        }
        return Response.ok(transUnits).build();
    }

    public static boolean isNumeric(String value) {
        return value.matches("^\\d+$");
    }
}
