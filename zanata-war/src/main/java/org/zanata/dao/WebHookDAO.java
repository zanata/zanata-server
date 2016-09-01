package org.zanata.dao;

import org.hibernate.Query;
import org.hibernate.Session;

import javax.enterprise.context.RequestScoped;
import javax.inject.Named;
import org.zanata.model.WebHook;

import java.util.List;

@Named("webHookDAO")
@RequestScoped
public class WebHookDAO extends AbstractDAOImpl<WebHook, Long> {

    public WebHookDAO() {
        super(WebHook.class);
    }

    public WebHookDAO(Session session) {
        super(WebHook.class, session);
    }

    public List<WebHook> findByUrl(String url) {
        Query q = getSession().createQuery("from WebHook where url =:url")
            .setParameter("url", url)
            .setCacheable(true)
            .setComment("WebHookDAO.findByUrl");
        return q.list();
    }
}
