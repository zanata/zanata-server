package org.zanata.exception;

public class ProjectNotFoundException extends RuntimeException {
    private static final long serialVersionUID = -7920694286L;

    public ProjectNotFoundException() {
        super();
    }

    public ProjectNotFoundException(String message) {
        super(message);
    }

}
