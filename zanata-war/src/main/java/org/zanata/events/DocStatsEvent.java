package org.zanata.events;

import java.util.HashMap;
import java.util.Map;

import org.zanata.common.ContentState;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;

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
    private final Map<ContentState, Integer> wordDeltasByState;

    private final Long lastModifiedTargetId;

    public static Map<ContentState, Integer> updateContentState(
        @Nullable Map<ContentState, Integer> contentStates, ContentState newState,
        ContentState previousState, @Nullable Long longWordCount) {

        Map<ContentState, Integer> newContentStates =
            contentStates == null ? new HashMap<ContentState, Integer>() :
                contentStates;
        int wordCount = longWordCount == null ? 0 : longWordCount.intValue();

        Integer previousStateCount =
            newContentStates.getOrDefault(previousState, 0);
        previousStateCount -= wordCount;
        newContentStates.put(previousState, previousStateCount);

        Integer newStateCount = newContentStates.getOrDefault(newState, 0);
        newStateCount += wordCount;
        newContentStates.put(newState, newStateCount);

        return newContentStates;
    }
}
