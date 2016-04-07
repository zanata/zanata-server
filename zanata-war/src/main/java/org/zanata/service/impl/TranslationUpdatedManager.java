package org.zanata.service.impl;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;

import com.google.common.base.Optional;
import org.apache.deltaspike.core.api.provider.BeanManagerProvider;
import org.zanata.ApplicationConfiguration;
import org.zanata.async.Async;
import org.zanata.common.LocaleId;
import org.zanata.dao.DocumentDAO;
import org.zanata.dao.PersonDAO;
import org.zanata.dao.TextFlowDAO;
import org.zanata.events.DocumentStatisticUpdatedEvent;
import org.zanata.events.TextFlowTargetStateEvent;
import org.zanata.events.TranslationUpdatedEvent;
import org.zanata.model.HDocument;
import org.zanata.model.HPerson;
import org.zanata.model.HProject;
import org.zanata.model.WebHook;
import org.zanata.rest.dto.User;
import org.zanata.rest.editor.service.UserService;
import org.zanata.service.TranslationStateCache;

import com.google.common.annotations.VisibleForTesting;
import lombok.extern.slf4j.Slf4j;
import org.zanata.util.UrlUtil;

import javax.enterprise.event.Observes;
import javax.enterprise.event.TransactionPhase;

/**
 * Manager that handles post update of translation. Important:
 * TextFlowTargetStateEvent IS NOT asynchronous, that is why
 * DocumentStatisticUpdatedEvent is used for webhook processes.
 * See {@link org.zanata.events.TextFlowTargetStateEvent}
 * See {@link org.zanata.events.DocumentStatisticUpdatedEvent}
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
    private TextFlowDAO textFlowDAO;

    @Inject
    private DocumentDAO documentDAO;

    @Inject
    private PersonDAO personDAO;

    @Inject
    private UserService userService;

    @Inject
    private ApplicationConfiguration applicationConfiguration;

    @Inject
    private UrlUtil urlUtil;

    /**
     * This method contains all logic to be run immediately after a Text Flow
     * Target has been successfully translated.
     */
    @Async
    public void textFlowStateUpdated(
            @Observes(during = TransactionPhase.AFTER_SUCCESS)
            TextFlowTargetStateEvent event) {
        translationStateCacheImpl.textFlowStateUpdated(event);
        publishAsyncEvent(event);

        processWebHookEvent(event);
    }

    // Fire asynchronous event
    void publishAsyncEvent(TextFlowTargetStateEvent event) {
        if (BeanManagerProvider.isActive()) {
            int wordCount = textFlowDAO.getWordCount(event.getTextFlowId());

            // TODO use Event.fire()
            BeanManagerProvider.getInstance().getBeanManager().fireEvent(
                    new DocumentStatisticUpdatedEvent(
                            event.getProjectIterationId(),
                            event.getDocumentId(), event.getLocaleId(),
                            wordCount,
                            event.getPreviousState(), event.getNewState())
            );
        }
    }

    void processWebHookEvent(TextFlowTargetStateEvent event) {
        HPerson person = personDAO.findById(event.getActorId());
        if(person == null) {
            return;
        }
        HDocument document = documentDAO.findById(event.getDocumentId());
        String docId = document.getDocId();
        String versionSlug = document.getProjectIteration().getSlug();
        HProject project = document.getProjectIteration().getProject();
        String projectSlug = project.getSlug();

        int wordCount = textFlowDAO.getWordCount(event.getTextFlowId());

        User user = userService.transferToUser(person.getAccount(),
            applicationConfiguration.isDisplayUserEmail());

        String url = urlUtil
            .fullEditorTransUnitUrl(projectSlug, versionSlug,
                event.getLocaleId(),
                LocaleId.EN_US, docId, event.getTextFlowId());

        TranslationUpdatedEvent webhookEvent =
            new TranslationUpdatedEvent(user, project.getSlug(),
                versionSlug, docId, event.getLocaleId(), url,
                event.getPreviousState(), event.getNewState(), wordCount);

        for (WebHook webHook : project.getWebHooks()) {
            publishWebhookEvent(webHook, webhookEvent);
        }
    }

    void publishWebhookEvent(WebHook webHook,
        TranslationUpdatedEvent translationUpdatedEvent) {
        WebHooksPublisher.publish(webHook.getUrl(), translationUpdatedEvent,
            Optional.fromNullable(webHook.getSecret()));
        log.debug("firing webhook: {}:{}", webHook.getUrl(),
            translationUpdatedEvent);
    }

    @VisibleForTesting
    public void init(TranslationStateCache translationStateCacheImpl,
        TextFlowDAO textFlowDAO, DocumentDAO documentDAO, PersonDAO personDAO,
        UserService userService,
        ApplicationConfiguration applicationConfiguration, UrlUtil urlUtil) {
        this.translationStateCacheImpl = translationStateCacheImpl;
        this.textFlowDAO = textFlowDAO;
        this.documentDAO = documentDAO;
        this.personDAO = personDAO;
        this.userService = userService;
        this.applicationConfiguration = applicationConfiguration;
        this.urlUtil = urlUtil;
    }
}
