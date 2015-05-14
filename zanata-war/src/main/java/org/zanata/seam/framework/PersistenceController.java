package org.zanata.seam.framework;

/**
 * Base class for controller objects which require a persistence context object.
 *
 * @param <T>
 *            the persistence context class (eg. Session or EntityManager)
 * @author Gavin King
 */
/*
 * Implementation copied from:
 *
 * https://source.jboss.org/browse/Seam/branches/community/Seam_2_3/jboss-seam/src
 * /main/java/org/jboss/seam/framework/PersistenceController.java?r=14108
 *
 * in preparation for a migration to a different framework.
 */
public abstract class PersistenceController<T> extends Controller {
    private transient T persistenceContext;

    public T getPersistenceContext() {
        if (persistenceContext == null) {
            persistenceContext =
                    (T) getComponentInstance(getPersistenceContextName());
        }
        return persistenceContext;
    }

    public void setPersistenceContext(T persistenceContext) {
        this.persistenceContext = persistenceContext;
    }

    protected abstract String getPersistenceContextName();

}
