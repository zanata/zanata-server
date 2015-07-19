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

import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.Set;

/**
 * Describes all the membership roles of a person in a project.
 *
 * This is designed for use in the project permissions editing dialog.
 */
@Getter
@Setter
public class PersonProjectMemberships {

    private HPerson person;

    private Set<ProjectRole> projectRoles;

    private Map<HLocale, Set<LocaleRole>> localeRoles;
}
