package org.zanata.exception;

public class ProjectNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final String projectSlug;

    public ProjectNotFoundException(String projectSlug) {
        this.projectSlug = projectSlug;
    }

    public String getProjectSlug() {
        return projectSlug;
    }
}
