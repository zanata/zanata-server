/*
 * Copyright 2016, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata.rest.search.service;

import org.apache.deltaspike.jpa.api.transaction.Transactional;
import org.apache.lucene.queryParser.ParseException;
import org.zanata.dao.LocaleDAO;
import org.zanata.dao.PersonDAO;
import org.zanata.dao.ProjectDAO;
import org.zanata.dao.VersionGroupDAO;
import org.zanata.rest.search.dto.GroupSearchResult;
import org.zanata.rest.search.dto.LanguageTeamSearchResult;
import org.zanata.rest.search.dto.PersonSearchResult;
import org.zanata.rest.search.dto.ProjectSearchResult;
import org.zanata.rest.search.dto.SearchResult;
import org.zanata.service.GravatarService;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import java.util.List;
import java.util.stream.Collectors;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static org.zanata.rest.search.dto.SearchResult.SearchResultType.LanguageTeam;
import static org.zanata.rest.search.dto.SearchResult.SearchResultType.Person;
import static org.zanata.rest.search.dto.SearchResult.SearchResultType.Project;

/**
 * @author Carlos Munoz <a href="mailto:camunoz@redhat.com">camunoz@redhat.com</a>
 */
@RequestScoped
@Path("/search")
@Produces(APPLICATION_JSON)
@Transactional
public class SearchService {

    @Inject
    private ProjectDAO projectDAO;

    @Inject
    private PersonDAO personDAO;

    @Inject
    private GravatarService gravatarService;

    @Inject
    private LocaleDAO localeDAO;

    @Inject
    private VersionGroupDAO versionGroupDAO;

    private static final int MAX_RESULT = 20;

    @GET
    public List<SearchResult> search(
            @QueryParam("q") @DefaultValue("") String query) {
        List<SearchResult> searchResults = searchProjects(query);
        searchResults.addAll(searchGroups(query));
        searchResults.addAll(searchPeople(query));
        searchResults.addAll(searchLanguageTeams(query));
        return searchResults;
    }

    @GET
    @Path("/projects")
    public List<SearchResult> searchProjects(@QueryParam("q") @DefaultValue("") String query) {
        try {
            return projectDAO.searchProjects(query, MAX_RESULT, 0, false).stream().map(p -> {
                ProjectSearchResult result = new ProjectSearchResult();
                result.setId(p.getSlug());
                result.setTitle(p.getName());
                result.setDescription(p.getDescription());
                // TODO is contributor count feasible?
                return result;
            }).collect(Collectors.toList());
        }
        catch (ParseException e) {
            // TODO Handle better
            throw new RuntimeException(e);
        }
    }

    @GET
    @Path("/groups")
    public List<SearchResult> searchGroups(@QueryParam("q") @DefaultValue("") String query) {
        return versionGroupDAO.searchGroupBySlugAndName(query, MAX_RESULT, 0).stream().map(g -> {
            GroupSearchResult result = new GroupSearchResult();
            result.setId(g.getSlug());
            result.setTitle(g.getName());
            result.setDescription(g.getDescription());
            return result;
        }).collect(Collectors.toList());
    }

    @GET
    @Path("/people")
    public List<SearchResult> searchPeople(@QueryParam("q") @DefaultValue("") String query) {
        return personDAO.findAllContainingName(query).stream().map(p -> {
            PersonSearchResult result = new PersonSearchResult();
            result.setId(p.getAccount().getUsername());
            result.setDescription(p.getName());
            result.setAvatarUrl(gravatarService.getUserImageUrl(50, p.getEmail()));
            return result;
        }).collect(Collectors.toList());
    }

    @GET
    @Path("/teams/language")
    public List<SearchResult> searchLanguageTeams(@QueryParam("q") @DefaultValue("") String query) {
        return localeDAO.searchByName(query).stream().map(l -> {
            LanguageTeamSearchResult result = new LanguageTeamSearchResult();
            result.setId(l.getLocaleId().getId());
            result.setLocale(l.asULocale().getDisplayName());
            result.setMemberCount(l.getMembers().size());
            return result;
        }).collect(Collectors.toList());
    }
}
