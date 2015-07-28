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

package org.zanata.model;

import com.google.common.collect.ListMultimap;
import com.google.common.collect.Sets;
import lombok.Getter;
import lombok.Setter;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

/**
 * Describes all the membership roles of a person in a project.
 *
 * This is designed for use in the project permissions editing dialog.
 */
@Getter
public class PersonProjectMemberships {

    private HPerson person;

    @Setter
    private boolean maintainer;
    @Setter
    private boolean translationMaintainer;

    private Set<LocaleRoles> localeRoles;

    public PersonProjectMemberships(HPerson person, Collection<ProjectRole> projectRoles,
                                    ListMultimap<HLocale, LocaleRole> localeRoleMappings) {
        this.person = person;

        maintainer = projectRoles != null &&
                projectRoles.contains(ProjectRole.Maintainer);
        translationMaintainer = projectRoles != null &&
                projectRoles.contains(ProjectRole.TranslationMaintainer);

        localeRoles = Sets.newHashSet();
        if (localeRoleMappings != null) {
            for (Map.Entry<HLocale, Collection<LocaleRole>> entry : localeRoleMappings.asMap().entrySet()) {
                localeRoles.add(new LocaleRoles(entry.getKey(), entry.getValue()));
            }
        }
    }

    /**
     * Represents a locale and the membership in each locale role.
     *
     * Intended to use as a row for a single locale in a permission setting table.
     */
    @Getter
    public class LocaleRoles {
        private HLocale locale;

        @Setter
        private boolean translator;
        @Setter
        private boolean reviewer;
        @Setter
        private boolean coordinator;

        public LocaleRoles(HLocale locale, Collection<LocaleRole> roles) {
            this.locale = locale;
            translator = roles.contains(LocaleRole.Translator);
            reviewer = roles.contains(LocaleRole.Reviewer);
            coordinator = roles.contains(LocaleRole.Coordinator);
        }

        @Override
        public boolean equals(Object obj) {
            if (obj == null) {
                return false;
            } else if (!(obj instanceof LocaleRoles)) {
                return false;
            } else {
                final LocaleRoles other = (LocaleRoles) obj;
                return locale.equals(other.locale);
            }
        }

        @Override
        public int hashCode() {
            return locale.hashCode();
        }
    }
}
