package org.zanata.dao;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.model.Request;

/**
 * @author Alex Eng <a href="aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("requestDAO")
@AutoCreate
@Scope(ScopeType.STATELESS)
public class RequestDAO extends AbstractDAOImpl<Request, Long> {

    public RequestDAO() {
        super(Request.class);
    }

    public Request getById(Long requestId) {
        return findById(requestId);
    }
}
