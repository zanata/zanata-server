package org.zanata.events;

import java.util.HashMap;
import java.util.Map;

import org.zanata.common.ContentState;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

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

    public static Map<ContentState, Long> updateContentStateDeltas(
            @Nullable Map<ContentState, Long> contentStates,
            ContentState newState,
            ContentState previousState, long wordCount) {

        Map<ContentState, Long> newContentStates =
                contentStates == null ? new HashMap<ContentState, Long>()
                        : contentStates;

        long previousStateCount =
                newContentStates.getOrDefault(previousState, 0L);
        previousStateCount -= wordCount;
        newContentStates.put(previousState, previousStateCount);

        long newStateCount = newContentStates.getOrDefault(newState, 0L);
        newStateCount += wordCount;
        newContentStates.put(newState, newStateCount);

        return newContentStates;
    }
}
