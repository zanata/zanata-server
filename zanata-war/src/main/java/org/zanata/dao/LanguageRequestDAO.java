package org.zanata.dao;

import com.google.common.collect.Lists;
import org.hibernate.Query;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.common.LocaleId;
import org.zanata.model.HAccount;
import org.zanata.model.HLocale;
import org.zanata.model.LanguageRequest;
import org.zanata.model.LocaleRole;
import org.zanata.model.type.RequestState;

import javax.annotation.Nullable;
import java.util.List;
import java.util.Set;

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

    public LanguageRequest findRequesterOutstandingRequests(HAccount requester,
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

    public List<LanguageRequest> findOutstandingRequests(
        List<LocaleId> localeIds) {
        String query =
            "from LanguageRequest req where req.request.validTo is null and req.locale.localeId in (:localeIds)";
        Query q = getSession().createQuery(query)
            .setParameterList("localeIds", localeIds)
            .setCacheable(true).setComment(
                "requestDAO.findOutstandingRequests");
        return q.list();
    }
}
