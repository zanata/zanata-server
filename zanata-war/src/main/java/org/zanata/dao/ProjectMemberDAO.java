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
package org.zanata.dao;

import lombok.extern.slf4j.Slf4j;
import org.hibernate.Query;
import org.hibernate.Session;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.model.HLocale;
import org.zanata.model.HPerson;
import org.zanata.model.HProject;
import org.zanata.model.HProjectMember;
import org.zanata.model.PersonProjectMemberships;
import org.zanata.model.ProjectRole;

import java.util.HashSet;
import java.util.Set;

import static org.zanata.model.LocaleRole.Coordinator;
import static org.zanata.model.LocaleRole.Reviewer;
import static org.zanata.model.LocaleRole.Translator;
import static org.zanata.model.ProjectRole.Maintainer;
import static org.zanata.model.ProjectRole.TranslationMaintainer;

/**
 * Provides methods to access data related to membership in a project.
 */
@Name("projectMemberDAO")
@AutoCreate
@Scope(ScopeType.STATELESS)
@Slf4j
public class ProjectMemberDAO
        extends AbstractDAOImpl<HProjectMember, HProjectMember.HProjectMemberPK> {

    public ProjectMemberDAO() {
        super(HProjectMember.class);
    }

    public ProjectMemberDAO(Session session) {
        super(HProjectMember.class, session);
    }

    /**
     * Retrieve all of a person's roles in a project.
     */
    public Set<ProjectRole> getRolesInProject(HPerson person, HProject project) {
        Query query = getSession().createQuery(
                "from HProjectMember as m where m.person = :person " +
                        "and m.project = :project")
                .setParameter("person", person)
                .setParameter("project", project)
                .setComment("ProjectMemberDAO.getRolesInProject");
        return new HashSet<>(query.list());
    }

    /**
     * Check whether a person has a specified role in a project.
     *
     * @return true if the given person has the given role in the given project.
     */
    public boolean hasProjectRole(HPerson person, HProject project, ProjectRole role) {
        Query query = getSession().createQuery(
                "select count(m) from HProjectMember as m " +
                        "where m.person = :person " +
                        "and m.project = :project " +
                        "and m.role = :role")
                .setParameter("person", person)
                .setParameter("project", project)
                .setParameter("role", role)
                .setComment("ProjectMemberDAO.hasProjectRole");
        return ((Long) query.uniqueResult()) > 0;
    }

    /**
     * Update all memberships for a person in the given project
     *
     * @param project
     * @param memberships
     */
    public void updatePermissions(HProject project, PersonProjectMemberships memberships) {
        log.info("Update permissions for person {}", memberships.getPerson().getAccount().getUsername());

        HPerson person = memberships.getPerson();

        // per membership:
        // look it up
        //   remove if needed
        //   add if needed


        //        final HPerson person = memberships.getPerson();
        ensureMembership(project, memberships.isMaintainer(), asMember(project, person, Maintainer));
        ensureMembership(project, memberships.isTranslationMaintainer(),
                asMember(project, person, TranslationMaintainer));


        //        for (PersonProjectMemberships.LocaleRoles localeRoles
        //                : memberships.getLocaleRoles()) {
        //            HLocale locale = localeRoles.getLocale();
        //            ensureMembership(localeRoles.isTranslator(), asMember(locale, person, Translator));
        //            ensureMembership(localeRoles.isReviewer(), asMember(locale, person, Reviewer));
        //            ensureMembership(localeRoles.isCoordinator(), asMember(locale, person, Coordinator));
        //        }

        getSession().flush();
    }

    private HProjectMember asMember(HProject project, HPerson person, ProjectRole role) {
        return new HProjectMember(project, person, role);
    }

    /**
     * Ensure the given membership is present or absent.
     */
    private void ensureMembership(HProject project, boolean shouldBePresent, HProjectMember membership) {
        log.info("ensure project membership ({}, {}, {})",
                membership.getPerson().getAccount().getUsername(),
                membership.getRole(),
                shouldBePresent);

        final Set<HProjectMember> members = project.getMembers();
        final boolean isPresent = members.contains(membership);

        if (isPresent != shouldBePresent) {
            // have to add or remove, so make sure it is in the session
            if (!getSession().contains(membership)) {
                membership = (HProjectMember) getSession().merge(membership);
            }

            if (shouldBePresent) {
                getSession().save(membership);
                members.add(membership);
            } else {
                getSession().delete(membership);
                members.remove(membership);
            }
        }

    }


}
