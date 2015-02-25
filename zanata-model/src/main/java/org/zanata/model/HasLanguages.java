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
package org.zanata.model;

import org.zanata.common.LocaleId;
import org.zanata.model.HLocale;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Describes some fundamental operations required to manipulate locales.
 */
public interface HasLanguages {

    boolean isOverrideLocales();
    public void setOverrideLocales(boolean overrideLocales);

    /**
     * Locale aliases that should be used for this entity.
     *
     * These should only be considered valid to use when isOverrideLocales() returns true,
     * otherwise the values from a parent entity or the server should be used.
     *
     * @return locale alias strings mapped by their locale
     */
    Map<LocaleId, String> getLocaleAliases();

    /**
     * Locales that should be used for this project.
     *
     * These should only be considered valid to use when isOverrideLocales() returns true,
     * otherwise the values from a parent entity or the server should be used.
     *
     * @return locales that are enabled for this entity.
     */
    Set<HLocale> getCustomizedLocales();

}
