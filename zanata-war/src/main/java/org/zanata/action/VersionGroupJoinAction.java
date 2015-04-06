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

import lombok.Getter;
import lombok.Setter;

import org.apache.commons.lang.StringUtils;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.security.management.JpaIdentityStore;
import org.zanata.common.EntityStatus;
import org.zanata.common.ProjectType;
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
import org.zanata.webtrans.shared.model.ProjectIterationId;

import org.zanata.ui.faces.FacesMessages;

import com.google.common.collect.Lists;

@AutoCreate
@Name("versionGroupJoinAction")
@Scope(ScopeType.PAGE)
public class VersionGroupJoinAction extends AbstractAutocomplete<HProject>
        implements Serializable {
    private static final long serialVersionUID = 1L;

    @In("jsfMessages")
    private FacesMessages facesMessages;

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

    @Getter
    @Setter
    private String slug;

    @Getter
    private String projectSlug;

    @Getter
    private List<SelectableVersion> projectVersions = Lists.newArrayList();

    public boolean hasSelectedVersion() {
        if(projectVersions.isEmpty()) {
            return false;
        }
        for (SelectableVersion projectVersion : projectVersions) {
            if (projectVersion.isSelected()) {
                return true;
            }
        }
        return false;
    }

    public String getGroupName() {
        return versionGroupDAO.getBySlug(slug).getName();
    }

    public List<SelectableVersion> getVersions() {
        if (projectVersions.isEmpty() && StringUtils.isNotEmpty(projectSlug)) {
            List<HProjectIteration> versions =
                    projectIterationDAO.getByProjectSlug(projectSlug,
                        EntityStatus.ACTIVE, EntityStatus.READONLY);
            for (HProjectIteration version : versions) {
                if(!isVersionInGroup(version.getId())) {
                    projectVersions
                            .add(new SelectableVersion(projectSlug, version
                                    .getSlug(), version.getProjectType(), false));
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
            sendEmail.setEmailType(
                SendEmailAction.EMAIL_TYPE_REQUEST_TO_JOIN_GROUP);
            String result = sendEmail.sendToVersionGroupMaintainer(maintainers);
            clearFormFields();
            return result;
        } else {
            facesMessages.addGlobal(
                    "#{msgs['jsf.NoProjectVersionSelected']}");
            return "failure";
        }
    }

    /**
     * This is to reset data when user closes dialog or after sending email.
     * See version-group/request_join_modal.xhtml#cancelJoinGroupEmail
     */
    public void clearFormFields() {
        projectSlug = "";
        projectVersions.clear();
        setQuery("");
    }

    @Override
    public List<HProject> suggest() {
        // Need to clear the all the versions displayed in dialog from previous
        // selected project when user is entering a new project search(autocomplete)
        projectVersions.clear();
        return projectDAO.getProjectsForMaintainer(
                authenticatedAccount.getPerson(), getQuery(), 0,
                Integer.MAX_VALUE);
    }

    @Override
    public void onSelectItemAction() {
        projectSlug = getSelectedItem();
    }

    public final class SelectableVersion extends ProjectIterationId {
        @Getter
        @Setter
        private boolean selected;

        public SelectableVersion(String projectSlug, String versionSlug,
                ProjectType projectType, boolean selected) {
            super(projectSlug, versionSlug, projectType);
            this.selected = selected;
        }
    }
}
