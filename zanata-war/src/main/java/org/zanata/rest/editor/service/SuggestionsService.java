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
package org.zanata.rest.editor.service;

import com.google.common.base.Joiner;
import com.googlecode.totallylazy.Either;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.common.LocaleId;
import org.zanata.model.HLocale;
import org.zanata.rest.editor.dto.suggestion.Suggestion;
import org.zanata.rest.editor.service.resource.SuggestionsResource;
import org.zanata.service.LocaleService;
import org.zanata.service.TranslationMemoryService;
import org.zanata.webtrans.shared.model.TransMemoryQuery;

import javax.annotation.Nullable;
import javax.ws.rs.Path;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;
import java.util.List;

import static javax.ws.rs.core.Response.Status.BAD_REQUEST;
import static org.zanata.webtrans.shared.rpc.HasSearchType.*;

/**
 * @see org.zanata.rest.editor.service.resource.SuggestionsResource
 */
@Name("editor.suggestionsService")
@Path(SuggestionsResource.SERVICE_PATH)
@Transactional
public class SuggestionsService implements SuggestionsResource {

    public static final String SEARCH_TYPES = Joiner.on(", ").join(SearchType.values());

    @In("translationMemoryServiceImpl")
    private TranslationMemoryService transMemoryService;

    @In("localeServiceImpl")
    private LocaleService localeService;

    @Override
    public Response query(List<String> query, String sourceLocaleString, String transLocaleString, String searchTypeString) {

        Either<SearchType, Response> searchTypeOrErrorResponse = getSearchType(searchTypeString);
        if (searchTypeOrErrorResponse.isRight()) {
            return searchTypeOrErrorResponse.right();
        }
        SearchType searchType = searchTypeOrErrorResponse.left();

        Either<LocaleId, Response> sourceLocaleOrError = getSourceLocale(sourceLocaleString);
        if (sourceLocaleOrError.isRight()) {
            return sourceLocaleOrError.right();
        }
        LocaleId sourceLocale = sourceLocaleOrError.left();

        Either<LocaleId, Response> transLocaleOrError = getTransLocale(transLocaleString);
        if (transLocaleOrError.isRight()) {
            return transLocaleOrError.right();
        }
        LocaleId transLocale = transLocaleOrError.left();

        List<Suggestion> suggestions = transMemoryService.searchTransMemoryWithDetails(transLocale, sourceLocale,
                new TransMemoryQuery(query, searchType));

        // Wrap in generic entity to prevent type erasure, so that an
        // appropriate MessageBodyReader can be used.
        // see docs for GenericEntity
        GenericEntity<List<Suggestion>> entity = new GenericEntity<List<Suggestion>>(suggestions) {};

        return Response.ok(entity).build();
    }

    private Either<LocaleId, Response> getSourceLocale(String localeString) {
        return getLocaleOrError(localeString, "Unrecognized source locale: \"%s\"");
    }

    private Either<LocaleId, Response> getTransLocale(String localeString) {
        return getLocaleOrError(localeString, "Unrecognized translation locale: \"%s\"");
    }

    /**
     * Try to get a valid locale for a given string. If the string does not match a supported
     * locale, generate an error response with the given error message.
     *
     * @param localeString used to look up the locale
     * @param errorFormat error to display. Include "%s" to substitute the locale string.
     * @return a LocaleId if the given string matches one, otherwise an error response.
     */
    private Either<LocaleId, Response> getLocaleOrError(final String localeString, final String errorFormat) {
        final String errorMessage = String.format(errorFormat, localeString);
        final Response.ResponseBuilder errorResponse = Response.status(BAD_REQUEST).entity(errorMessage);

        try {
            @Nullable HLocale hLocale = localeService.getByLocaleId(localeString);
            if (hLocale == null) {
                return Either.right(errorResponse.build());
            }
            return Either.left(hLocale.getLocaleId());
        } catch (IllegalArgumentException e) {
            return Either.right(errorResponse.build());
        }
    }


    /**
     * Try to get a valid search type constant for a given string. If the string does not
     * match a valid search type, generate an error response with appropriate error message.
     *
     * @param searchTypeString used to look up the search type.
     * @return A SearchType if the given string matches one, otherwise an error response.
     */
    private Either<SearchType, Response> getSearchType(String searchTypeString) {
        try {
            SearchType searchType = SearchType.valueOf(searchTypeString);
            return Either.left(searchType);
        } catch (IllegalArgumentException e) {
            String error = String.format("Unrecognized search type: \"%s\". Expected one of: %s",
                    searchTypeString, SEARCH_TYPES);
            return Either.right(Response.status(BAD_REQUEST).entity(error).build());
        }
    }
}
