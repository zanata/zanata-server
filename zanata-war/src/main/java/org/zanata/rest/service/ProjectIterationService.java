/*
 * Copyright 2010, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata.rest.service;

import javax.annotation.Nonnull;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;

import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.rest.dto.ProjectIteration;

/**
 * This service class is deprecated. See {@link ProjectVersionService}.
 */
@Name("projectIterationService")
@Path(ProjectIterationResource.SERVICE_PATH)
@Transactional
@Deprecated
public class ProjectIterationService implements ProjectIterationResource {
    /** Project Identifier. */
    @PathParam("projectSlug")
    private String projectSlug;

    /** Project Iteration identifier. */
    @PathParam("iterationSlug")
    private String iterationSlug;

    @In
    private ProjectVersionService projectVersionService;

    @SuppressWarnings("null")
    @Nonnull
    public String getProjectSlug() {
        return projectSlug;
    }

    @SuppressWarnings("null")
    @Nonnull
    public String getIterationSlug() {
        return iterationSlug;
    }

    @Override
    public Response head() {
        return projectVersionService.head(projectSlug, iterationSlug);
    }

    @Override
    public Response get() {
        return projectVersionService.getVersion(projectSlug, iterationSlug);
    }

    @Override
    public Response put(ProjectIteration projectIteration) {
        return projectVersionService
            .put(projectSlug, iterationSlug, projectIteration);
    }

    @Override
    public Response sampleConfiguration() {
        return projectVersionService.sampleConfiguration(projectSlug,
            iterationSlug);
    }
}
