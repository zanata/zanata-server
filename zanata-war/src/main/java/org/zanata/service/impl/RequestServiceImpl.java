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
import org.zanata.events.RequestUpdatedEvent;
import org.zanata.exception.RequestExistException;
import org.zanata.model.HAccount;
import org.zanata.model.HLocale;
import org.zanata.model.LanguageRequest;
import org.zanata.model.Request;
import org.zanata.model.type.RequestState;
import org.zanata.model.type.RequestType;
import org.zanata.service.RequestService;
import org.zanata.util.Event;

import javax.persistence.EntityNotFoundException;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;

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

    @In("event")
    private Event<RequestUpdatedEvent> requestUpdatedEvent;

    @Override
    public LanguageRequest createLanguageRequest(HAccount requester,
            HLocale locale, boolean isRequestAsCoordinator,
            boolean isRequestAsReviewer, boolean isRequestAsTranslator)
            throws RequestExistException {
        //search if there's any existing language request
        //of the same requester, account and locale

        LanguageRequest languageRequest =
            languageRequestDAO.findRequesterPendingRequests(requester,
                locale.getLocaleId());

        if (languageRequest != null) {
            throw new RequestExistException(
                RequestType.LOCALE + ", " + requester.getUsername() + ", " +
                    ", " + locale.getDisplayName());
        }
        String entityId = UUID.randomUUID().toString();
        Request request = new Request(RequestType.LOCALE, requester, entityId);

        languageRequest =
            new LanguageRequest(request, locale, isRequestAsCoordinator,
                isRequestAsReviewer, isRequestAsTranslator);
        requestDAO.makePersistent(request);
        languageRequestDAO.makePersistent(languageRequest);
        return languageRequest;
    }

    @Override
    public boolean isLanguageRequestExist(HAccount requester, HLocale locale) {
        LanguageRequest languageRequest =
                languageRequestDAO.findRequesterPendingRequests(requester,
                    locale.getLocaleId());
        return languageRequest != null;
    }

    @Override
    public void updateLanguageRequest(Long requestId, HAccount actor,
        RequestState state, String comment) throws EntityNotFoundException {
        LanguageRequest languageRequest = languageRequestDAO.findById(requestId);
        if (languageRequest != null) {
            Request request = languageRequest.getRequest();

            Request newRequest = request.update(actor, state, comment);
            requestDAO.makePersistent(request);

            //Need to add 1 second to request validTo date to avoid unique index constraint
            newRequest.setValidTo(addOneSecond(request.getValidTo()));
            languageRequest.setRequest(newRequest);
            requestDAO.makePersistent(request);
            requestDAO.makePersistent(newRequest);
            languageRequestDAO.makePersistent(languageRequest);
            requestUpdatedEvent.fire(new RequestUpdatedEvent(
                newRequest.getId(), languageRequest.getId(), actor.getId(),
                state));
        } else {
            throw new EntityNotFoundException();
        }
    }

    /**
     * Add 1 second to the given Date
     * @param date
     */
    private Date addOneSecond(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.SECOND, 1);
        return cal.getTime();
    }

    @Override
    public LanguageRequest getLanguageRequest(Long id) {
        return languageRequestDAO.findById(id);
    }

    @Override
    public LanguageRequest getPendingLanguageRequests(HAccount account,
        LocaleId localeId) {
        return languageRequestDAO.findRequesterPendingRequests(
            account, localeId);
    }

    @Override
    public List<LanguageRequest> getPendingLanguageRequests(
        LocaleId... localeIds) {
        return languageRequestDAO
            .findPendingRequests(Lists.newArrayList(localeIds));
    }

    @Override
    public Request getPendingRequestByEntityId(String entityId) {
        return requestDAO.getPendingRequestByEntityId(entityId);
    }

    @Override
    public List<Request> getRequestByEntityId(String entityId) {
        return requestDAO.getByEntityId(entityId);
    }

    /**
     * Return true if request have been processed (validTo is not null)
     * @param request
     */
    private boolean isRequestProcessed(Request request) {
        return request.getValidTo() != null;
    }
}
