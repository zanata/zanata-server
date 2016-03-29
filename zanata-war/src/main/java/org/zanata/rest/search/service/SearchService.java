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

import com.google.common.collect.Lists;
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
import org.zanata.rest.search.dto.SearchResults;
import org.zanata.service.GravatarService;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;
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
    private static final int DEFAULT_PAGE = 1;

    @GET
    @Path("/projects")
    public SearchResults searchProjects(
        @QueryParam("q") @DefaultValue("") String query,
        @DefaultValue("1") @QueryParam("page") int page,
        @DefaultValue("20") @QueryParam("sizePerPage") int sizePerPage) {

        sizePerPage = (sizePerPage > MAX_RESULT) ? MAX_RESULT :
            ((sizePerPage < 1) ? 1 : sizePerPage);
        page = page < 1 ? 1 : page;
        int offset = (page - 1) * sizePerPage;

        try {
            int totalCount = projectDAO.getQueryProjectSize(query, false);
            List<SearchResult> results =
                projectDAO.searchProjects(query, sizePerPage, offset, false)
                    .stream().map(p -> {
                    ProjectSearchResult result = new ProjectSearchResult();
                    result.setId(p.getSlug());
                    result.setTitle(p.getName());
                    result.setDescription(p.getDescription());
                    // TODO is contributor count feasible?
                    return result;
                }).collect(Collectors.toList());
            return new SearchResults(totalCount, results, SearchResult.SearchResultType.Project);
        } catch (ParseException e) {
            // TODO Handle better
            throw new RuntimeException(e);
        }
    }

    @GET
    @Path("/groups")
    public SearchResults searchGroups(
        @QueryParam("q") @DefaultValue("") String query,
        @DefaultValue("1") @QueryParam("page") int page,
        @DefaultValue("20") @QueryParam("sizePerPage") int sizePerPage) {

        sizePerPage = (sizePerPage > MAX_RESULT) ? MAX_RESULT :
            ((sizePerPage < 1) ? 1 : sizePerPage);
        page = page < 1 ? 1 : page;
        int offset = (page - 1) * sizePerPage;

        int totalCount = versionGroupDAO.searchGroupBySlugAndNameCount(query);

        List<SearchResult> results = versionGroupDAO
            .searchGroupBySlugAndName(query, sizePerPage, offset)
            .stream().map(g -> {
                GroupSearchResult result = new GroupSearchResult();
                result.setId(g.getSlug());
                result.setTitle(g.getName());
                result.setDescription(g.getDescription());
                return result;
            }).collect(Collectors.toList());
        return new SearchResults(totalCount, results, SearchResult.SearchResultType.Group);
    }

    @GET
    @Path("/people")
    public SearchResults searchPeople(
        @QueryParam("q") @DefaultValue("") String query,
        @DefaultValue("1") @QueryParam("page") int page,
        @DefaultValue("20") @QueryParam("sizePerPage") int sizePerPage) {

        sizePerPage = (sizePerPage > MAX_RESULT) ? MAX_RESULT :
            ((sizePerPage < 1) ? 1 : sizePerPage);
        page = page < 1 ? 1 : page;
        int offset = (page - 1) * sizePerPage;

        int totalCount = personDAO.findAllContainingNameSize(query);
        List<SearchResult> results = personDAO.findAllContainingName(query, sizePerPage, offset)
            .stream().map(p -> {
                PersonSearchResult result = new PersonSearchResult();
                result.setId(p.getAccount().getUsername());
                result.setDescription(p.getName());
                result.setAvatarUrl(
                    gravatarService.getUserImageUrl(50, p.getEmail()));
                return result;
            }).collect(Collectors.toList());
        return new SearchResults(totalCount, results, SearchResult.SearchResultType.Person);
    }

    @GET
    @Path("/teams/language")
    public SearchResults searchLanguageTeams(
        @QueryParam("q") @DefaultValue("") String query,
        @DefaultValue("1") @QueryParam("page") int page,
        @DefaultValue("20") @QueryParam("sizePerPage") int sizePerPage) {

        sizePerPage = (sizePerPage > MAX_RESULT) ? MAX_RESULT :
            ((sizePerPage < 1) ? 1 : sizePerPage);
        page = page < 1 ? 1 : page;
        int offset = (page - 1) * sizePerPage;

        int totalCount = localeDAO.searchByNameCount(query);
        List<SearchResult> results = localeDAO.searchByName(query, sizePerPage, offset).stream()
            .map(l -> {
                LanguageTeamSearchResult result =
                    new LanguageTeamSearchResult();
                result.setId(l.getLocaleId().getId());
                result.setLocale(l.asULocale().getDisplayName());
                result.setMemberCount(l.getMembers().size());
                return result;
            }).collect(Collectors.toList());
        return new SearchResults(totalCount, results, SearchResult.SearchResultType.LanguageTeam);
    }
}
