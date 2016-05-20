package org.zanata.model.type;

import lombok.Getter;

/**
 * Type of Webhook event. See {@link org.zanata.model.WebHook} for usage.
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public enum WebhookType {
    DocumentMilestoneEvent("DOC_MILESTONE"),
    DocumentStatsEvent("DOC_STATS");

    @Getter
    private final String abbr;

    WebhookType(String abbr) {
        this.abbr = abbr;
    }

    public static WebhookType getValueOf(String abbr) {
        switch (abbr) {
            case "DOC_MILESTONE":
                return DocumentMilestoneEvent;
            case "DOC_STATS":
                return DocumentStatsEvent;
            default:
                throw new IllegalArgumentException(abbr);
        }
    }
}
