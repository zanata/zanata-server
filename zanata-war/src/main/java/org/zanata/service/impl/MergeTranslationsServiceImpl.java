/*
 * Copyright 2015, Red Hat, Inc. and individual contributors
 * as indicated by the @author tags. See the copyright.txt file in the
 * distribution for a full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package org.zanata.service.impl;

import java.util.concurrent.Future;

import javax.annotation.Nonnull;

import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.async.AsyncTaskResult;
import org.zanata.async.ContainsAsyncMethods;
import org.zanata.async.handle.MergeTranslationsTaskHandle;
import org.zanata.common.ContentState;
import org.zanata.dao.ProjectIterationDAO;
import org.zanata.dao.TextFlowTargetDAO;
import org.zanata.model.HProjectIteration;
import org.zanata.model.HTextFlowTarget;
import org.zanata.security.ZanataIdentity;
import org.zanata.service.MergeTranslationsService;

import com.google.common.base.Optional;
import com.google.common.base.Stopwatch;

/**
 * Service provider for merge translations task.
 * @see org.zanata.action.MergeTranslationsManager
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("mergeTranslationsServiceImpl")
@Scope(ScopeType.STATELESS)
@Slf4j
@ContainsAsyncMethods
public class MergeTranslationsServiceImpl implements MergeTranslationsService {

    @In
    private ProjectIterationDAO projectIterationDAO;

    @In
    private TextFlowTargetDAO textFlowTargetDAO;

    @In
    private ZanataIdentity identity;

    private final static int TRANSLATION_BATCH_SIZE = 50;

    @Override
    public Future<Void> startMergeTranslations(String sourceProjectSlug,
        String sourceVersionSlug, String targetProjectSlug,
        String targetVersionSlug, boolean useLatestTranslatedString,
        MergeTranslationsTaskHandle handle) {

        HProjectIteration sourceVersion =
            projectIterationDAO.getBySlug(sourceProjectSlug, sourceVersionSlug);

        HProjectIteration targetVersion =
            projectIterationDAO.getBySlug(targetProjectSlug, targetVersionSlug);

        if(!verifyVersions(sourceVersion, targetVersion)) {
            return null;
        }

        Optional<MergeTranslationsTaskHandle> taskHandleOpt =
            Optional.fromNullable(handle);

        if (taskHandleOpt.isPresent()) {
            prepareMergeTranslationsHandle(sourceVersion, targetVersion,
                taskHandleOpt.get());
        }

        Stopwatch overallStopwatch = Stopwatch.createStarted();
        log.info("merge translations start: from {} to {}", sourceProjectSlug
                + ":" + sourceVersionSlug, targetProjectSlug + ":"
                + targetVersionSlug);

        int startCount = 0;
        int totalCount = getTotalProgressCount(sourceVersion.getId(),
                        targetVersion.getId());

        while (startCount < totalCount) {
            int processedCount =
                    mergeTranslationBatch(sourceVersion.getId(),
                            targetVersion.getId(), useLatestTranslatedString,
                            startCount, TRANSLATION_BATCH_SIZE);

            if (taskHandleOpt.isPresent()) {
                taskHandleOpt.get().increaseProgress(processedCount);
            }

            startCount += TRANSLATION_BATCH_SIZE;
        }

        log.info("merge translation end: from {} to {}, {}", sourceProjectSlug
                + ":" + sourceVersionSlug, targetProjectSlug + ":"
                + targetVersionSlug, overallStopwatch);

        return AsyncTaskResult.taskResult();
    }

    private int mergeTranslationBatch(Long sourceVersionId,
            Long targetVersionId, boolean useLatestTranslatedString,
            int offset, int batchSize) {
        try {
            return new MergeTranslationsWork(sourceVersionId, targetVersionId,
                    offset, batchSize, useLatestTranslatedString,
                    textFlowTargetDAO).workInTransaction();
        } catch (Exception e) {
            log.warn("exception during copy text flow target", e);
            return 0;
        }
    }

    /**
     * Check if sourceVersion or targetVersion exists and there's document in
     * both
     * 
     * @param sourceVersion
     * @param targetVersion
     * @return
     */
    private boolean verifyVersions(HProjectIteration sourceVersion,
            HProjectIteration targetVersion) {
        if (sourceVersion == null) {
            log.error("Cannot find source version of {}:{}", sourceVersion
                    .getProject().getSlug(), sourceVersion.getSlug());
            return false;
        }
        if (targetVersion == null) {
            log.error("Cannot find target version of {}:{}", targetVersion
                    .getProject().getSlug(), targetVersion.getSlug());
            return false;
        }
        if(sourceVersion.getDocuments().isEmpty()) {
            log.error("No documents in source version {}:{}", sourceVersion
                .getProject().getSlug(), sourceVersion.getSlug());
            return false;
        }
        if(targetVersion.getDocuments().isEmpty()) {
            log.error("No documents in target version {}:{}", targetVersion
                .getProject().getSlug(), targetVersion.getSlug());
            return false;
        }
        return true;
    }

    private void prepareMergeTranslationsHandle(
        @Nonnull HProjectIteration sourceVersion,
        @Nonnull HProjectIteration targetVersion,
        @Nonnull MergeTranslationsTaskHandle handle) {
        handle.setTriggeredBy(identity.getAccountUsername());

        int total = getTotalProgressCount(sourceVersion.getId(),
            targetVersion.getId());
        handle.setMaxProgress(total);
        handle.setTotalTranslations(total);
    }

    @Override
    public int getTotalProgressCount(Long sourceVersionId, Long targetVersionId) {
        return textFlowTargetDAO.getTranslationsByMatchedContextCount(
            sourceVersionId, targetVersionId, ContentState.TRANSLATED_STATES);
    }
}
