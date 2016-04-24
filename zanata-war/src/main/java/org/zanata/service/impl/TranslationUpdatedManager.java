package org.zanata.service.impl;

import java.util.List;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;

import org.zanata.ApplicationConfiguration;
import org.zanata.async.Async;
import org.zanata.common.LocaleId;
import org.zanata.dao.DocumentDAO;
import org.zanata.dao.PersonDAO;
import org.zanata.dao.TextFlowTargetDAO;
import org.zanata.events.DocStatsEvent;
import org.zanata.events.TextFlowTargetStateEvent;
import org.zanata.webhook.events.DocumentStatsEvent;
import org.zanata.model.HDocument;
import org.zanata.model.HPerson;
import org.zanata.model.HProject;
import org.zanata.model.HTextFlowTarget;
import org.zanata.model.WebHook;
import org.zanata.rest.dto.User;
import org.zanata.rest.editor.service.UserService;
import org.zanata.service.TranslationStateCache;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Optional;
import lombok.extern.slf4j.Slf4j;

import javax.enterprise.event.Observes;
import javax.enterprise.event.TransactionPhase;

/**
 * Manager that handles post update of translation. Important:
 * TextFlowTargetStateEvent IS NOT asynchronous, that is why
 * DocumentStatisticUpdatedEvent is used for webhook processes. See
 * {@link org.zanata.events.TextFlowTargetStateEvent} See
 * {@link org.zanata.webhook.events.DocumentStatsEvent}
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Named("translationUpdatedManager")
@RequestScoped
@Slf4j
public class TranslationUpdatedManager {

    @Inject
    private TranslationStateCache translationStateCacheImpl;

    @Inject
    private TextFlowTargetDAO textFlowTargetDAO;

    @Inject
    private PersonDAO personDAO;

    @Inject
    private DocumentDAO documentDAO;

    @Inject
    private UserService userService;

    @Inject
    private ApplicationConfiguration applicationConfiguration;

    @Async
    public void docStatsUpdated(
        @Observes(during = TransactionPhase.AFTER_SUCCESS)
        DocStatsEvent event) {
        processWebHookEvent(event);
    }

    void processWebHookEvent(DocStatsEvent event) {
        HTextFlowTarget target =
                textFlowTargetDAO.findById(event.getLastModifiedTargetId());
        HPerson person = target.getLastModifiedBy();
        if(person == null) {
            return;
        }
        HDocument document = documentDAO.findById(event.getKey().getDocumentId());
        String docId = document.getDocId();
        String versionSlug = document.getProjectIteration().getSlug();
        HProject project = document.getProjectIteration().getProject();
        if (project.getWebHooks().isEmpty()) {
            return;
        }
        String projectSlug = project.getSlug();
        LocaleId localeId = event.getKey().getLocaleId();

        User user = userService.transferToUser(person.getAccount(),
            applicationConfiguration.isDisplayUserEmail());

        DocumentStatsEvent webhookEvent =
            new DocumentStatsEvent(user, projectSlug,
                versionSlug, docId, localeId, event.getWordDeltasByState());

        publishWebhookEvent(project.getWebHooks(), webhookEvent);
    }

    public void publishWebhookEvent(List<WebHook> webHooks,
            DocumentStatsEvent event) {
        for (WebHook webHook : webHooks) {
            WebHooksPublisher.publish(webHook.getUrl(), event,
                    Optional.fromNullable(webHook.getSecret()));
        }
    }

    @VisibleForTesting
    public void init(TranslationStateCache translationStateCacheImpl,
            DocumentDAO documentDAO,
            PersonDAO personDAO, TextFlowTargetDAO textFlowTargetDAO,
            UserService userService,
            ApplicationConfiguration applicationConfiguration) {
        this.translationStateCacheImpl = translationStateCacheImpl;
        this.documentDAO = documentDAO;
        this.personDAO = personDAO;
        this.textFlowTargetDAO = textFlowTargetDAO;
        this.userService = userService;
        this.applicationConfiguration = applicationConfiguration;
    }
}
