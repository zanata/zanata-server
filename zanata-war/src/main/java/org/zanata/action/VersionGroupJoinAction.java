/*
 * Copyright 2010, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata.action;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import org.apache.commons.lang.StringUtils;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.faces.FacesMessages;
import org.jboss.seam.security.management.JpaIdentityStore;
import org.zanata.dao.ProjectDAO;
import org.zanata.dao.ProjectIterationDAO;
import org.zanata.dao.VersionGroupDAO;
import org.zanata.i18n.Messages;
import org.zanata.model.HAccount;
import org.zanata.model.HPerson;
import org.zanata.model.HProject;
import org.zanata.model.HProjectIteration;
import org.zanata.service.VersionGroupService;
import org.zanata.ui.AbstractAutocomplete;

import com.google.common.collect.Lists;

@AutoCreate
@Name("versionGroupJoinAction")
@Scope(ScopeType.PAGE)
public class VersionGroupJoinAction extends AbstractAutocomplete<HProject>
        implements Serializable {
    private static final long serialVersionUID = 1L;

    @In
    private VersionGroupService versionGroupServiceImpl;

    @In
    private ProjectDAO projectDAO;

    @In
    private ProjectIterationDAO projectIterationDAO;

    @In
    private VersionGroupDAO versionGroupDAO;

    @In(create = true)
    private SendEmailAction sendEmail;

    @In(required = false, value = JpaIdentityStore.AUTHENTICATED_USER)
    private HAccount authenticatedAccount;

    @In
    private Messages msgs;

    @Getter
    @Setter
    private String slug;

    @Getter
    private String projectSlug;

    @Getter
    private List<SelectableProject> projectVersions = Lists.newArrayList();

    public boolean hasSelectedVersion() {
        for (SelectableProject projectVersion : projectVersions) {
            if (projectVersion.isSelected()) {
                return true;
            }
        }
        return false;
    }

    public String getGroupName() {
        return versionGroupDAO.getBySlug(slug).getName();
    }

    public List<SelectableProject> getVersions() {
        if (StringUtils.isNotEmpty(projectSlug)) {
            List<HProjectIteration> versions =
                    projectIterationDAO.getByProjectSlug(projectSlug);
            for (HProjectIteration version : versions) {
                if(!isVersionInGroup(version.getId())) {
                    projectVersions.add(new SelectableProject(version, false));
                }
            }
        }
        return projectVersions;
    }

    public boolean isVersionInGroup(Long versionId) {
        return versionGroupServiceImpl.isVersionInGroup(slug, versionId);
    }

    public void cancel() {
        sendEmail.cancel();
    }

    public String send() {
        if (hasSelectedVersion()) {
            List<HPerson> maintainers = Lists.newArrayList();
            for (HPerson maintainer : versionGroupServiceImpl
                    .getMaintainersBySlug(slug)) {
                maintainers.add(maintainer);
            }
            sendEmail.setEmailType(SendEmailAction.EMAIL_TYPE_REQUEST_TO_JOIN_GROUP);
            return sendEmail.sendToVersionGroupMaintainer(maintainers);
        } else {
            FacesMessages.instance().add(msgs.get("jsf.NoProjectVersionSelected"));
            return "failure";
        }
    }

    @Override
    public List<HProject> suggest() {
        projectVersions = null;
        return projectDAO.getProjectsForMaintainer(
                authenticatedAccount.getPerson(), getQuery(), 0,
                Integer.MAX_VALUE);
    }

    @Override
    public void onSelectItemAction() {
        projectSlug = getSelectedItem();
    }

    @AllArgsConstructor
    @Getter
    public final class SelectableProject {
        private HProjectIteration projectIteration;

        @Setter
        private boolean selected;
    }
}
