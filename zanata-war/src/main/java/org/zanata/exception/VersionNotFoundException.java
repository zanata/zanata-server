package org.zanata.exception;

public class VersionNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final String projectSlug;
    private final String versionSlug;

    public VersionNotFoundException(String projectSlug, String versionSlug) {
        this.projectSlug = projectSlug;
        this.versionSlug = versionSlug;
    }

    public String getProjectSlug() {
        return projectSlug;
    }

    public String getVersionSlug() {
        return versionSlug;
    }
}
