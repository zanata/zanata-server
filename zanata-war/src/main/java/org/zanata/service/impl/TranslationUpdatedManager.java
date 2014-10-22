package org.zanata.service.impl;

import com.google.common.annotations.VisibleForTesting;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Observer;
import org.jboss.seam.annotations.Scope;
import org.zanata.dao.TextFlowDAO;
import org.zanata.events.TextFlowTargetStateEvent;
import org.zanata.service.DocumentService;
import org.zanata.service.TranslationStateCache;
import org.zanata.ui.model.statistic.WordStatistic;
import org.zanata.util.StatisticsUtil;

import lombok.extern.slf4j.Slf4j;

/**
 * Manager that handles post update of translation. See
 * {@link org.zanata.events.TextFlowTargetStateEvent}
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("translationUpdatedManager")
@Scope(ScopeType.STATELESS)
@Slf4j
public class TranslationUpdatedManager {

    @In
    private TranslationStateCache translationStateCacheImpl;

    @In
    private DocumentService documentServiceImpl;

    @In
    private TextFlowDAO textFlowDAO;

    /**
     * This method contains all logic to be run immediately after a Text Flow
     * Target has been successfully translated.
     */
    @Observer(TextFlowTargetStateEvent.EVENT_NAME)
    public void textFlowStateUpdated(TextFlowTargetStateEvent event) {
        translationStateCacheImpl.textFlowStateUpdated(event);

        WordStatistic stats =
                translationStateCacheImpl.getDocumentStatistics(
                        event.getDocumentId(), event.getLocaleId());

        int wordCount = textFlowDAO.getWordCount(event.getTextFlowId());

        WordStatistic oldStats = StatisticsUtil.copyWordStatistic(stats);
        oldStats.decrement(event.getNewState(), wordCount);
        oldStats.increment(event.getPreviousState(), wordCount);

        documentServiceImpl.documentStatisticUpdated(oldStats, stats, event);

    }

    @VisibleForTesting
    public void init(TranslationStateCache translationStateCacheImpl,
            DocumentService documentServiceImpl, TextFlowDAO textFlowDAO) {
        this.translationStateCacheImpl = translationStateCacheImpl;
        this.documentServiceImpl = documentServiceImpl;
        this.textFlowDAO = textFlowDAO;
    }
}
