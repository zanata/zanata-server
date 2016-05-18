package org.zanata.events;

import java.util.HashMap;
import java.util.Map;

import org.zanata.common.ContentState;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import com.google.common.collect.Maps;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@AllArgsConstructor
@Getter
@EqualsAndHashCode
public class DocStatsEvent {
    private final DocumentLocaleKey key;

    private final Long projectVersionId;

    /**
     * Updated content states with word counts
     */
    private final Map<ContentState, Long> wordDeltasByState;

    private final Long lastModifiedTargetId;

    public static void updateContentStateDeltas(
            @Nonnull Map<ContentState, Long> contentStates,
            ContentState newState, ContentState previousState, long wordCount) {

        long previousStateCount =
                contentStates.getOrDefault(previousState, 0L);
        previousStateCount -= wordCount;
        contentStates.put(previousState, previousStateCount);

        long newStateCount = contentStates.getOrDefault(newState, 0L);
        newStateCount += wordCount;
        contentStates.put(newState, newStateCount);
    }
}
