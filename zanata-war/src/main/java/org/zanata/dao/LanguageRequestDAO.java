package org.zanata.dao;

import org.hibernate.Query;
import org.hibernate.Session;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.common.LocaleId;
import org.zanata.model.HAccount;
import org.zanata.model.LanguageRequest;

import java.util.List;

/**
 * @author Alex Eng <a href="aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("languageRequestDAO")
@AutoCreate
@Scope(ScopeType.STATELESS)
public class LanguageRequestDAO extends AbstractDAOImpl<LanguageRequest, Long> {

    public LanguageRequestDAO() {
        super(LanguageRequest.class);
    }

    public LanguageRequestDAO(Session session) {
        super(LanguageRequest.class, session);
    }

    public LanguageRequest findRequesterPendingRequests(HAccount requester,
        LocaleId localeId) {
        String query =
            "from LanguageRequest req where req.locale.localeId = :localeId and req.request.requester.id = :requesterId and req.request.validTo is null";
        Query q = getSession().createQuery(query)
            .setParameter("requesterId", requester.getId())
            .setParameter("localeId", localeId)
            .setCacheable(true).setComment(
                "requestDAO.findRequestInLocale");
        return (LanguageRequest) q.uniqueResult();
    }

    public List<LanguageRequest> findPendingRequests(
        List<LocaleId> localeIds) {
        String query =
            "from LanguageRequest req where req.request.validTo is null and req.locale.localeId in (:localeIds)";
        Query q = getSession().createQuery(query)
            .setParameterList("localeIds", localeIds)
            .setCacheable(true).setComment(
                "requestDAO.findPendingRequests");
        return q.list();
    }
}
