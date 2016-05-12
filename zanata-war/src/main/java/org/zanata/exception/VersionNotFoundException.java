package org.zanata.exception;

public class VersionNotFoundException extends RuntimeException {
    private static final long serialVersionUID = -7920694286L;

    public VersionNotFoundException() {
        super();
    }

    public VersionNotFoundException(String message) {
        super(message);
    }

}
