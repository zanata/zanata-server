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

package org.zanata.service.impl;

import com.google.common.collect.Lists;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.common.LocaleId;
import org.zanata.dao.LanguageRequestDAO;
import org.zanata.dao.RequestDAO;
import org.zanata.exception.RequestExistException;
import org.zanata.model.HAccount;
import org.zanata.model.HLocale;
import org.zanata.model.LanguageRequest;
import org.zanata.model.LocaleRole;
import org.zanata.model.Request;
import org.zanata.model.type.RequestState;
import org.zanata.model.type.RequestType;
import org.zanata.seam.security.ZanataJpaIdentityStore;
import org.zanata.service.RequestService;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @author Alex Eng <a href="aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("requestServiceImpl")
@Scope(ScopeType.STATELESS)
public class RequestServiceImpl implements RequestService {

    @In
    private RequestDAO requestDAO;

    @In
    private LanguageRequestDAO languageRequestDAO;

    @In
    private SequenceIdGenerator sequenceIdGenerator;

    @In(required = false, value = ZanataJpaIdentityStore.AUTHENTICATED_USER)
    private HAccount authenticatedAccount;

    @Override
    public LanguageRequest createLanguageRequest(HAccount requester,
            HLocale locale, boolean isRequestAsTranslator,
            boolean isRequestAsReviewer, boolean isRequestAsCoordinator)
            throws RequestExistException {
        //search if there's any existing language request
        //of the same requester, account and locale

        LanguageRequest languageRequest =
            languageRequestDAO.findRequesterOutstandingRequests(requester,
                locale.getLocaleId());

        if (languageRequest != null) {
            throw new RequestExistException(
                RequestType.LOCALE + ", " + requester.getUsername() + ", " +
                    ", " + locale.getDisplayName());
        }
        Request request = new Request(RequestType.LOCALE, requester);
//        request.setEntityId(sequenceIdGenerator.getNextId());

        languageRequest =
            new LanguageRequest(request, locale, isRequestAsCoordinator,
                isRequestAsReviewer, isRequestAsTranslator);
        requestDAO.makePersistent(request);
        languageRequestDAO.makePersistent(languageRequest);
        return languageRequest;
    }

    @Override
    public boolean isRequestExist(HAccount requester, HLocale locale) {
        LanguageRequest languageRequest =
                languageRequestDAO.findRequesterOutstandingRequests(requester,
                        locale.getLocaleId());
        return languageRequest != null;
    }

    @Override
    public void cancelRequest(HAccount requester, HLocale locale) {
        LanguageRequest languageRequest =
            languageRequestDAO.findRequesterOutstandingRequests(requester,
                locale.getLocaleId());
        String comment =
            "Request cancelled by requester {" + requester.getUsername() + "}";
        if(languageRequest != null) {
            updateLanguageRequest(languageRequest.getRequest().getId(),
                requester, RequestState.CANCELLED, comment);
        }
    }

    @Override
    public Request updateLanguageRequest(Long requestId, HAccount actor,
        RequestState state, String comment) throws EntityNotFoundException {
        LanguageRequest languageRequest = languageRequestDAO.findById(requestId);
        if (languageRequest != null
                && languageRequest.getRequest().getValidTo() == null) {
            Request request = languageRequest.getRequest();
            boolean persistLanguageRequest = false;
            if (isRequestProcessed(request)) {
                request = request.clone();
                languageRequest.setRequest(request);
                persistLanguageRequest = true;
            }
            request.update(actor, state, comment);
            requestDAO.makePersistent(request);
            if (persistLanguageRequest) {
                languageRequestDAO.makePersistent(languageRequest);
            }
            return request;
        }
        throw new EntityNotFoundException();
    }

    @Override
    public LanguageRequest getLanguageRequest(Long id) {
        return languageRequestDAO.findById(id);
    }

    @Override
    public LanguageRequest getMyPendingLanguageRequests(LocaleId localeId) {
        return languageRequestDAO.findRequesterOutstandingRequests(
            authenticatedAccount, localeId);
    }

    @Override
    public List<LanguageRequest> getOutstandingLanguageRequests(
        LocaleId... localeIds) {
        return languageRequestDAO
            .findOutstandingRequests(Lists.newArrayList(localeIds));
    }

    /**
     * Return true if request have been processed (validTo is not null)
     * @param request
     */
    private boolean isRequestProcessed(Request request) {
        return request.getValidTo() != null;
    }
}
