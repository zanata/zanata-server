package org.zanata.service.impl;

import java.io.Serializable;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;

import org.ocpsoft.common.util.Strings;
import org.zanata.events.WebhookEventType;
import org.zanata.i18n.Messages;
import org.zanata.model.ProjectRole;
import org.zanata.model.WebHook;
import org.zanata.model.type.WebhookType;
import org.zanata.webhook.events.ProjectMaintainerChangedEvent;
import org.zanata.webhook.events.SourceDocumentChangedEvent;
import org.zanata.webhook.events.TestEvent;
import org.zanata.webhook.events.VersionChangedEvent;

import com.google.common.base.Function;
import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Slf4j
@Named("webhookServiceImpl")
@RequestScoped
public class WebhookServiceImpl implements Serializable {

    @Inject
    private Messages msgs;

    /**
     * Process TestEvent
     */
    public void processTestEvent(String username, String projectSlug,
            String url, String secret) {
        TestEvent event = new TestEvent(username, projectSlug);
        WebHooksPublisher
                .publish(url, event, Optional.fromNullable(secret));
    }

    /**
     * Process VersionChangedEvent
     */
    public void processWebhookVersionChanged(String projectSlug, String versionSlug,
            List<WebHook> webHooks, VersionChangedEvent.ChangeType changeType) {
        List<WebHook> versionWebhooks =
                filterWebhookByType(webHooks, WebhookType.VersionChangedEvent);

        if (versionWebhooks.isEmpty()) {
            return;
        }
        VersionChangedEvent event =
            new VersionChangedEvent(projectSlug, versionSlug, changeType);
        publishWebhooks(versionWebhooks, event);
    }

    /**
     * Process ProjectMaintainerChangedEvent
     */
    public void processWebhookMaintainerChanged(String projectSlug,
            String username, ProjectRole role, List<WebHook> webHooks,
            ProjectMaintainerChangedEvent.ChangeType changeType) {

        List<WebHook> maintainerWebhooks =
                filterWebhookByType(webHooks,
                        WebhookType.ProjectMaintainerChangedEvent);

        if (maintainerWebhooks.isEmpty()) {
            return;
        }
        ProjectMaintainerChangedEvent event =
                new ProjectMaintainerChangedEvent(projectSlug, username,
                    role, changeType);
        publishWebhooks(maintainerWebhooks, event);
    }

    /**
     * Process SourceDocumentChangedEvent
     */
    public void processWebhookSourceDocumentChanged(String project,
            String version, String docId, List<WebHook> webHooks,
            SourceDocumentChangedEvent.ChangeType changeType) {
        List<WebHook> eventWebhooks = filterWebhookByType(webHooks,
                WebhookType.SourceDocumentChangedEvent);

        if (eventWebhooks.isEmpty()) {
            return;
        }
        SourceDocumentChangedEvent event = new SourceDocumentChangedEvent(
                project, version, docId, changeType);

        publishWebhooks(eventWebhooks, event);
    }

    public List<WebhookTypeItem> getAvailableWebhookTypes() {
        WebhookTypeItem docMilestone =
            new WebhookTypeItem(WebhookType.DocumentMilestoneEvent,
                msgs.get(
                    "jsf.webhookType.DocumentMilestoneEvent.desc"));

        WebhookTypeItem stats =
            new WebhookTypeItem(WebhookType.DocumentStatsEvent,
                msgs.get("jsf.webhookType.DocumentStatsEvent.desc"));

        WebhookTypeItem version =
            new WebhookTypeItem(WebhookType.VersionChangedEvent,
                msgs.get("jsf.webhookType.VersionChangedEvent.desc"));

        WebhookTypeItem maintainer =
            new WebhookTypeItem(WebhookType.ProjectMaintainerChangedEvent,
                msgs.get("jsf.webhookType.ProjectMaintainerChangedEvent.desc"));

        WebhookTypeItem srcDoc =
            new WebhookTypeItem(WebhookType.SourceDocumentChangedEvent,
                msgs.get("jsf.webhookType.SourceDocumentChangedEvent.desc"));

        return Lists
            .newArrayList(docMilestone, stats, version, maintainer, srcDoc);
    }

    public List<String> getDisplayNames(Set<WebhookType> types) {
        return types.stream().map(WebhookType::getDisplayName)
            .collect(Collectors.toList());
    }

    public String getTypesAsString(WebHook webHook) {
        if (webHook == null) {
            return "";
        }
        List<String> results = webHook.getTypes().stream().map(Enum::name)
            .collect(Collectors.toList());
        return Strings.join(results, ",");
    }

    public static Set<WebhookType> getTypesFromString(String strTypes) {
        return new HashSet(
                Lists.transform(Lists.newArrayList(strTypes.split(",")),
                        convertToWebHookType));
    }

    private static Function convertToWebHookType =
            new Function<String, WebhookType>() {
                @Override
                public WebhookType apply(String input) {
                    return WebhookType.valueOf(input);
                }
            };

    /**
     * Object for all available webhook list
     */
    @Getter
    public final static class WebhookTypeItem {
        private WebhookType type;
        private String description;

        public WebhookTypeItem(WebhookType webhookType, String desc) {
            this.type = webhookType;
            this.description = desc;
        }
    }

    private void publishWebhooks(List<WebHook> webHooks,
        WebhookEventType event) {
        for (WebHook webhook : webHooks) {
            WebHooksPublisher.publish(webhook.getUrl(), event,
                Optional.fromNullable(webhook.getSecret()));
        }
    }

    private List<WebHook> filterWebhookByType(List<WebHook> webHooks,
            WebhookType webhookType) {
        return webHooks.stream().filter(webHook -> webHook.getTypes()
                .contains(webhookType)).collect(Collectors.toList());
    }
}
