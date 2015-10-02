package org.zanata.dao;

import org.hibernate.Query;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.model.HAccount;
import org.zanata.model.HLocale;
import org.zanata.model.LanguageRequest;

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

    public LanguageRequest getByRequestId(Long requestId) {
        String query = "from LanguageRequest req where req.request.id = :requestId";
        Query q = getSession().createQuery(query)
            .setParameter("requestId", requestId)
            .setCacheable(true).setComment(
                "requestDAO.getByRequestId");
        return (LanguageRequest)q.uniqueResult();
    }

    public LanguageRequest findRequest(HAccount requester, HAccount account,
        HLocale locale) {
        String query =
            "from LanguageRequest req where req.locale.id = :localeId and req.requester.id = :requesterId and req.account.id = :accountId";
        Query q = getSession().createQuery(query)
            .setParameter("requesterId", requester.getId())
            .setParameter("accountId", account.getId())
            .setParameter("localeId", locale.getId())
            .setCacheable(true).setComment(
                "requestDAO.findRequest");
        return (LanguageRequest) q.uniqueResult();
    }
}
