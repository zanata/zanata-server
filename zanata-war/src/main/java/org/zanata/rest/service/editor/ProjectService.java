package org.zanata.rest.service.editor;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;

import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("editor.projectService")
@Path(org.zanata.rest.service.editor.ProjectResource.SERVICE_PATH)
@Transactional
public class ProjectService implements ProjectResource {

    @In
    private org.zanata.rest.service.ProjectService projectService;

    @PathParam("projectSlug")
    String projectSlug;


    @Override
    public Response get() {
        return projectService.get();
    }

}
