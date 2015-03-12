package org.zanata.action;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.Factory;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Observer;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.annotations.Startup;
import org.jboss.seam.contexts.ServletLifecycle;

import javax.servlet.ServletContext;

@Name("servletContextFactory")
@Scope(ScopeType.APPLICATION)
@Startup
public class ServletContextFactory {

    ServletContext servletContext;

    @Observer({"org.jboss.seam.postInitialization", "org.jboss.seam.postReInitialization"})
    public void create() {
        servletContext = ServletLifecycle.getServletContext();
    }

    @Factory(autoCreate = true)
    public ServletContext getServletContext() {
        return servletContext;
    }

}
