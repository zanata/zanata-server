package org.zanata.exception;

/**
 * Exception for invalid API key.
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public class InvalidApiKeyException extends Exception {
    private static final String message = "Invalid API key";

    public InvalidApiKeyException(String username, String apiKey, String message) {
        super(getMessage(username, apiKey, message));
    }

    public InvalidApiKeyException(String username, String apiKey) {
        super(getMessage(username, apiKey));
    }

    public InvalidApiKeyException(String message) {
        super(getMessage(message));
    }

    public static String getMessage(String username, String apiKey,
            String additionalMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append(getMessage(username, apiKey))
                .append(" ").append(additionalMessage);
        return sb.toString();
    }

    public static String getMessage(String username, String apiKey) {
        StringBuilder sb = new StringBuilder();
        sb.append(message).append(" for user:[ ").append(username).append(" ]")
                .append(" apiKey:[ ").append(apiKey).append(" ].");
        return sb.toString();
    }

    public static String getMessage(String additionalMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append(message).append(". ").append(additionalMessage);
        return sb.toString();
    }
}
