package org.zanata.rest.editor.service;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;

import org.jboss.resteasy.util.GenericType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.common.EntityStatus;
import org.zanata.common.LocaleId;
import org.zanata.dao.LocaleDAO;
import org.zanata.dao.ProjectDAO;
import org.zanata.exception.ZanataServiceException;
import org.zanata.model.HLocale;
import org.zanata.model.HProject;
import org.zanata.rest.NoSuchEntityException;
import org.zanata.rest.ReadOnlyEntityException;
import org.zanata.rest.dto.Project;
import org.zanata.rest.editor.dto.Locale;
import org.zanata.rest.editor.dto.Permission;
import org.zanata.rest.editor.service.resource.ProjectResource;
import org.zanata.rest.service.ETagUtils;
import org.zanata.security.ZanataIdentity;

import java.lang.reflect.Type;
import java.util.List;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("editor.projectService")
@Path(ProjectResource.SERVICE_PATH)
@Transactional
public class ProjectService implements ProjectResource {

    @Context
    private Request request;

    @In
    private ETagUtils eTagUtils;

    @In
    private ProjectDAO projectDAO;

    @In
    private LocaleDAO localeDAO;

    @In
    private ZanataIdentity identity;

    @Override
    public Response getProject(@PathParam("projectSlug") String projectSlug) {
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
                            MediaType.APPLICATION_JSON_TYPE);
            return Response.ok(project).tag(etag).build();
        } catch (NoSuchEntityException e) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @Override
    public Response getPermission(@PathParam("projectSlug") String projectSlug,
            @PathParam("localeId") String localeId) {
        try {
            HProject hProject = projectDAO.getBySlug(projectSlug);
            if (hProject == null
                    || hProject.getStatus().equals(EntityStatus.OBSOLETE)) {
                return Response.status(Response.Status.NOT_FOUND).build();
            } else if (hProject.getStatus().equals(EntityStatus.READONLY)) {
                return Response.status(Response.Status.FORBIDDEN).build();
            }

            HLocale hLocale = localeDAO.findByLocaleId(new LocaleId(localeId));
            if (hLocale == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }

            boolean hasWritePermission =
                    identity.hasPermission("add-translation", hProject, hLocale);
            boolean hasReviewPermission = identity.hasPermission(
                    "review-translation", hProject, hLocale);

            Permission permission =
                    new Permission(hasWritePermission, hasReviewPermission);

            Type genericType = new GenericType<Permission>() {
            }.getGenericType();

            Object entity =
                    new GenericEntity<Permission>(permission, genericType);
            return Response.ok(entity).build();
        } catch (NoSuchEntityException e) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
}
