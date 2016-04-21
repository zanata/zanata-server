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
    private final Map<ContentState, Integer> contentStates;

    private final Long lastModifiedTargetId;

    public static Map<ContentState, Integer> updateContentState(
        @Nullable Map<ContentState, Integer> contentStates, ContentState newState,
        ContentState previousState, Long longWordCount) {

        Map<ContentState, Integer> newContentStates =
            contentStates == null ? new HashMap<ContentState, Integer>() :
                contentStates;
        int wordCount = longWordCount == null ? 0 : longWordCount.intValue();

        Integer previousStateCount = newContentStates.get(previousState);
        if (previousStateCount == null) {
            previousStateCount = wordCount * -1;
        } else {
            previousStateCount -= wordCount;
        }
        newContentStates.put(previousState, previousStateCount);

        Integer newStateCount = newContentStates.get(newState);
        if (newStateCount == null) {
            newStateCount = wordCount;
        } else {
            newStateCount += wordCount;
        }
        newContentStates.put(newState, newStateCount);
        return newContentStates;
    }
}
