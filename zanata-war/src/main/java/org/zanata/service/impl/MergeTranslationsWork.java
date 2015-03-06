package org.zanata.service.impl;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.core.Events;
import org.jboss.seam.util.Work;
import org.zanata.common.ContentState;
import org.zanata.dao.TextFlowTargetDAO;
import org.zanata.events.TextFlowTargetStateEvent;
import org.zanata.model.HSimpleComment;
import org.zanata.model.HTextFlow;
import org.zanata.model.HTextFlowTarget;
import org.zanata.service.TranslationStateCache;

import com.google.common.base.Stopwatch;
import org.zanata.util.MessageGenerator;

/**
 * Merge translation and persist in trasaction.
 *
 * Merge HTextFlowTargets from HProjectIteration(id=sourceVersionId) to
 * HProjectIteration(id=targetVersionId) in batches(batchStart, batchLength)
 *
 * @see org.zanata.service.impl.MergeTranslationsServiceImpl#startMergeTranslations
 * @see #shouldMerge
 *
 * @return count of processed translations.
 *
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Slf4j
@AllArgsConstructor
public class MergeTranslationsWork extends Work<Integer> {
    private final Long sourceVersionId;
    private final Long targetVersionId;
    private final int batchStart;
    private final int batchLength;
    private final boolean useLatestTranslatedString;

    private final TextFlowTargetDAO textFlowTargetDAO;

    private final TranslationStateCache translationStateCacheImpl;

    @Override
    protected Integer work() throws Exception {
        Stopwatch stopwatch = Stopwatch.createStarted();

        // TODO: remove this stopwatch
        Stopwatch queryStopwatch = Stopwatch.createStarted();
        List<HTextFlowTarget[]> matches =
                textFlowTargetDAO.getTranslationsByMatchedContext(
                        sourceVersionId, targetVersionId, batchStart,
                        batchLength, ContentState.TRANSLATED_STATES);
        queryStopwatch.stop();
        System.out.println("query time " + queryStopwatch);

        log.info("start merge translation from version {} to {} batch {}",
                sourceVersionId, targetVersionId, batchStart + " to "
                        + batchLength);

        for (HTextFlowTarget[] results : matches) {
            HTextFlowTarget sourceTft = results[0];
            HTextFlowTarget targetTft = results[1];
            if (shouldMerge(sourceTft, targetTft, useLatestTranslatedString)) {

                ContentState oldState = targetTft.getState();

                targetTft.setContents(sourceTft.getContents());
                targetTft.setState(sourceTft.getState());
                targetTft.setLastChanged(sourceTft.getLastChanged());
                targetTft.setLastModifiedBy(sourceTft.getLastModifiedBy());
                targetTft.setTranslator(sourceTft.getTranslator());

                if (sourceTft.getComment() == null) {
                    targetTft.setComment(null);
                } else {
                    HSimpleComment hComment = targetTft.getComment();
                    if (hComment == null) {
                        hComment = new HSimpleComment();
                        targetTft.setComment(hComment);
                    }
                    hComment.setComment(sourceTft.getComment().getComment());
                }
                targetTft.setRevisionComment(MessageGenerator
                        .getMergeTranslationMessage(sourceTft));

                textFlowTargetDAO.makePersistent(targetTft);

                HTextFlow tf = targetTft.getTextFlow();
                if (Events.exists()) {
                    Events.instance().raiseTransactionSuccessEvent(
                            TextFlowTargetStateEvent.EVENT_NAME,
                            new TextFlowTargetStateEvent(null,
                                    targetVersionId,
                                    tf.getDocument().getId(), tf.getId(),
                                    targetTft.getLocale().getLocaleId(),
                                    targetTft.getId(), targetTft.getState(),
                                    oldState));
                }
                translationStateCacheImpl.clearDocumentStatistics(targetTft
                        .getTextFlow().getDocument().getId());
            }
        }
        textFlowTargetDAO.flush();
        stopwatch.stop();
        log.info("Complete merge translation of {} in {}", matches.size(),
                stopwatch);
        return matches.size();
    }

    // @formatter:off
    /**
     * Rule of which translation should merge
     * |          from         |       to         |   copy?   |
     * |-----------------------|------------------|-----------|
     * |fuzzy/untranslated     |       any        |     no    |
     * |-----------------------|------------------|-----------|
     * |different source text/ |                  |           |
     * |document id            |       any        |     no    |
     * |-----------------------|------------------|-----------|
     * |translated/approved    |   untranslated   |    yes    |
     * |-----------------------|------------------|-----------|
     * |translated/approved    |       fuzzy      |    yes    |
     * |-----------------------|------------------|-----------|
     * |translated/approved    |   same as from   | copy if from is newer
     *                                              and option says to copy
     *
     * @param sourceTft - matched documentId, source text,
     *                    translated/approved HTextFlowTarget.
     *     @see org.zanata.dao.TextFlowTargetDAO#getTranslationsByMatchedContext
     * @param targetTft - HTextFlowTarget from target version
     */
    // @formatter:on
    public boolean shouldMerge(HTextFlowTarget sourceTft,
            HTextFlowTarget targetTft, boolean useLatestTranslatedString) {
        if (sourceTft.getState().isTranslated()) {
            return true;
        } else if (useLatestTranslatedString) {
            return sourceTft.getLastChanged().after(
                    targetTft.getLastChanged());
        }
        return false;
    }
}
