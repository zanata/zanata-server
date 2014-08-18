/*
 *
 *  * Copyright 2013, Red Hat, Inc. and individual contributors as indicated by the
 *  * @author tags. See the copyright.txt file in the distribution for a full
 *  * listing of individual contributors.
 *  *
 *  * This is free software; you can redistribute it and/or modify it under the
 *  * terms of the GNU Lesser General Public License as published by the Free
 *  * Software Foundation; either version 2.1 of the License, or (at your option)
 *  * any later version.
 *  *
 *  * This software is distributed in the hope that it will be useful, but WITHOUT
 *  * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 *  * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 *  * details.
 *  *
 *  * You should have received a copy of the GNU Lesser General Public License
 *  * along with this software; if not, write to the Free Software Foundation,
 *  * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 *  * site: http://www.fsf.org.
 */

package org.zanata.service;

import org.zanata.common.LocaleId;
import org.zanata.events.TextFlowTargetStateEvent;
import org.zanata.ui.model.statistic.WordStatistic;
import org.zanata.webtrans.shared.model.DocumentStatus;
import org.zanata.webtrans.shared.model.ValidationId;

/**
 * Defines a Cache Service for project version states.
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public interface TranslationStateCache {

    /**
     * Returns DocumentStatus of last modified HTextFlowTarget for the given
     * locale id of the documentId
     *
     * @param documentId
     * @param localeId
     */
    DocumentStatus getDocumentStatus(Long documentId, LocaleId localeId);


    /**
     * Return boolean of textFlowTarget has validation error against validation
     * rules {@link org.zanata.webtrans.share.model.ValidationAction}
     *
     * @param textFlowTargetId
     * @param validationId
     */
    Boolean textFlowTargetHasWarningOrError(Long targetId,
        ValidationId validationId);

    /**
     * Informs the cache that a text flow has changed its state in a given
     * locale. (It's really a Text Flow Target state)
     *
     */
    void textFlowStateUpdated(TextFlowTargetStateEvent event);

    /**
     * Return document wordStatistic in given localeId
     *
     * @param documentId
     * @param localeId
     */
    WordStatistic getDocumentStatistics(Long documentId,
            LocaleId localeId);
}
