/*
 * Copyright 2015, Red Hat, Inc. and individual contributors as indicated by the
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

package org.zanata.model.type;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

import com.google.common.collect.Lists;
import lombok.Getter;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public enum TranslationSourceType {
    COPY_TRANS("CT"),
    COPY_VERSION("CV"),
    MERGE_VERSION("MV"),
    TM_MERGE("TM"),
    GWT_EDITOR_ENTRY("GWT"),
    JS_EDITOR_ENTRY("JS"),
    API_UPLOAD("API"),
    WEB_UPLOAD("WEB"),
    MACHINE_TRANS("MT"),
    UNKNOWN("UNK");

    public static final Collection<TranslationSourceType> AUTOMATED_ENTRIES;

    static {
        AUTOMATED_ENTRIES = Collections.unmodifiableCollection(new HashSet(
            Arrays.asList(TranslationSourceType.COPY_TRANS,
                TranslationSourceType.COPY_VERSION,
                TranslationSourceType.MERGE_VERSION,
                TranslationSourceType.TM_MERGE)));
    }

    @Getter
    private final String abbr;

    private TranslationSourceType(String abbr) {
        this.abbr = abbr;
    }

    public static TranslationSourceType getValueOf(String abbr) {
        switch (abbr) {
            case "CT":
                return TranslationSourceType.COPY_TRANS;
            case "CV":
                return TranslationSourceType.COPY_VERSION;
            case "MV":
                return TranslationSourceType.MERGE_VERSION;
            case "TM":
                return TranslationSourceType.TM_MERGE;
            case "GWT":
                return TranslationSourceType.GWT_EDITOR_ENTRY;
            case "JS":
                return TranslationSourceType.JS_EDITOR_ENTRY;
            case "API":
                return TranslationSourceType.API_UPLOAD;
            case "WEB":
                return TranslationSourceType.WEB_UPLOAD;
            case "MT":
                return TranslationSourceType.MACHINE_TRANS;
            case "UNKNOWN":
                return TranslationSourceType.UNKNOWN;
            default:
                throw new IllegalArgumentException(String.valueOf(abbr));
        }
    }

    public boolean isAutomatedEntry() {
        return AUTOMATED_ENTRIES.contains(this);
    }
}
