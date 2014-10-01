package org.zanata.rest.service.editor;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;

import org.jboss.resteasy.util.HttpHeaderNames;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.dao.ProjectDAO;
import org.zanata.model.HProject;
import org.zanata.rest.NoSuchEntityException;
import org.zanata.rest.dto.Project;
import org.zanata.rest.service.ETagUtils;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("editor.projectService")
@Path(org.zanata.rest.service.editor.ProjectResource.SERVICE_PATH)
@Transactional
public class ProjectService implements ProjectResource {

    @HeaderParam(HttpHeaderNames.ACCEPT)
    @DefaultValue(MediaType.APPLICATION_JSON)
    @Context
    private MediaType accept;

    @Context
    private Request request;

    @In
    private ETagUtils eTagUtils;

    @In
    private ProjectDAO projectDAO;

    @PathParam("projectSlug")
    String projectSlug;

    @Override
    public Response get() {
        try {
            EntityTag etag = eTagUtils.generateTagForProject(projectSlug);

            Response.ResponseBuilder response =
                    request.evaluatePreconditions(etag);
            if (response != null) {
                return response.build();
            }

            HProject hProject = projectDAO.getBySlug(projectSlug);
            Project project =
                    org.zanata.rest.service.ProjectService.toResource(hProject,
                            accept);
            return Response.ok(project).tag(etag).build();
        } catch (NoSuchEntityException e) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

}
