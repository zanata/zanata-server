package org.zanata.exception;

/**
 * @author Alex Eng <a href="aeng@redhat.com">aeng@redhat.com</a>
 */
public class RequestExistException extends ZanataServiceException {

    public RequestExistException(String message) {
        super(message);
    }
}
