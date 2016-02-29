/*
 * Copyright 2014, Red Hat, Inc. and individual contributors as indicated by the
 * @author tags. See the copyright.txt file in the distribution for a full
 * listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */
package org.zanata.events;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.codehaus.jackson.annotate.JsonPropertyOrder;
import org.zanata.common.ContentState;
import org.zanata.common.LocaleId;
import org.zanata.rest.dto.User;

/**
 *
 * Event for when a translation being updated in Zanata
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({ "user", "project", "version", "docId", "locale", "url", "previousState", "newState", "wordCount"})
@EqualsAndHashCode
public class TranslationUpdatedEvent extends WebhookEventType {
    /**
     * User information
     * {@link org.zanata.rest.dto.User}
     */
    private User user;

    /**
     * Target project slug.
     * {@link org.zanata.model.HProject#slug}
     */
    private String project;

    /**
     * Target project version slug.
     * {@link org.zanata.model.HProjectIteration#slug}
     */
    private String version;

    /**
     * Target document full path id.
     * {@link org.zanata.model.HDocument#docId}
     */
    private String docId;

    /**
     * Target locale id.
     * {@link LocaleId}
     */
    private LocaleId locale;

    /**
     * Editor url in target translation.
     * {@link org.zanata.util.UrlUtil#fullEditorTransUnitUrl}
     */
    private String translationUrl;

    /**
     * Content state of translation before update
     */
    private ContentState previousState;

    /**
     * Content state of translation after update
     */
    private ContentState newState;

    /**
     * Word count of the updated translation
     */
    private int wordCount;
}
