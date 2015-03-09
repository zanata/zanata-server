package org.zanata.action;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.security.Identity;
import org.zanata.async.AsyncTaskHandleManager;
import org.zanata.async.handle.MergeTranslationsTaskHandle;
import org.zanata.service.MergeTranslationsService;

/**
 * Manages copy translations from existing version to another tasks.
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@AutoCreate
@Name("mergeTranslationsManager")
@Scope(ScopeType.STATELESS)
@Slf4j
public class MergeTranslationsManager implements Serializable {
    @In
    private AsyncTaskHandleManager asyncTaskHandleManager;

    @In
    private MergeTranslationsService mergeTranslationsServiceImpl;

    @In
    private Identity identity;

    /**
     * Merge translations from an existing version to another.
     *
     * @param sourceProjectSlug - source project identifier
     * @param sourceVersionSlug - source version identifier
     * @param targetProjectSlug - target project identifier
     * @param targetVersionSlug - target version identifier
     * @param useNewerTranslation - to override translated/approved string
     *                                 in target with newer entry in source
     */
    public void startMergeTranslations(String sourceProjectSlug,
            String sourceVersionSlug, String targetProjectSlug,
            String targetVersionSlug, boolean useNewerTranslation) {

        MergeTranslationsKey key =
                MergeTranslationsKey.getKey(targetProjectSlug,
                    targetVersionSlug);

        MergeTranslationsTaskHandle handle = new MergeTranslationsTaskHandle();
        asyncTaskHandleManager.registerTaskHandle(handle, key);
        mergeTranslationsServiceImpl.startMergeTranslations(sourceProjectSlug,
                sourceVersionSlug, targetProjectSlug, targetVersionSlug,
            useNewerTranslation, handle);
    }

    /**
     * Cancel running merge translations task
     * 
     * @param projectSlug - target project identifier
     * @param versionSlug - target version identifier
     */
    public void cancelMergeTranslations(String projectSlug, String versionSlug) {
        if (isMergeTranslationsRunning(projectSlug, versionSlug)) {
            MergeTranslationsTaskHandle handle =
                getMergeTranslationsProcessHandle(projectSlug, versionSlug);
            handle.cancel(true);
            handle.setCancelledTime(System.currentTimeMillis());
            handle.setCancelledBy(identity.getCredentials().getUsername());

            log.info("Merge translations cancelled- {}:{}", projectSlug,
                    versionSlug);
        }
    }

    public MergeTranslationsTaskHandle getMergeTranslationsProcessHandle(
            String projectSlug, String versionSlug) {
        return (MergeTranslationsTaskHandle) asyncTaskHandleManager
                .getHandleByKey(MergeTranslationsKey.getKey(projectSlug, versionSlug));
    }

    public boolean isMergeTranslationsRunning(String projectSlug, String versionSlug) {
        MergeTranslationsTaskHandle handle =
            getMergeTranslationsProcessHandle(projectSlug, versionSlug);
        return handle != null && !handle.isDone();
    }

    /**
     * Key used for copy version task
     * 
     */
    @EqualsAndHashCode
    @Getter
    @AllArgsConstructor
    public static final class MergeTranslationsKey implements Serializable {
        // target project identifier
        private final String projectSlug;
        // target version identifier
        private final String versionSlug;

        public static MergeTranslationsKey getKey(String projectSlug,
                String versionSlug) {
            return new MergeTranslationsKey(projectSlug, versionSlug);
        }
    }
}
