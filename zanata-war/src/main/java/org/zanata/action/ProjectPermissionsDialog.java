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

package org.zanata.action;

import lombok.extern.slf4j.Slf4j;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;

/**
 * Backing class for the project permissions dialog.
 *
 * This data would be stored in ProjectHome or ProjectHomeAction but for some
 * reason it is null. This class is an attempt to get a scope that won't wipe
 * out the data.
 */
@Name("projectPermissionDialog")
// TODO play with the scope until it works
@Scope(ScopeType.CONVERSATION)
@Slf4j
public class ProjectPermissionsDialog {

    // TODO move data from ProjectHome to here
    // TODO set data in this from people-tab.xhtml
    // TODO move set and save methods to here
}
