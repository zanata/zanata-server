package org.zanata.seam.framework;

import java.io.Serializable;

import org.jboss.seam.core.Mutable;

/**
 * Base class for controllers which implement the Mutable interface.
 *
 * @author Gavin King
 */
/*
 * Implementation copied from:
 *
 * https://source.jboss.org/browse/Seam/branches/community/Seam_2_3/jboss-seam/src
 * /main/java/org/jboss/seam/framework/MutableController.java?r=14108
 *
 * in preparation for a migration to a different framework.
 */
public abstract class MutableController<T>
        extends PersistenceController<T>
        implements Serializable, Mutable {
    // copy/paste from AbstractMutable

    private transient boolean dirty;

    public boolean clearDirty() {
        boolean result = dirty;
        dirty = false;
        return result;
    }

    /**
     * Set the dirty flag if the value has changed. Call whenever a subclass
     * attribute is updated.
     *
     * @param oldValue
     *            the old value of an attribute
     * @param newValue
     *            the new value of an attribute
     * @return true if the newValue is not equal to the oldValue
     */
    protected <U> boolean setDirty(U oldValue, U newValue) {
        boolean attributeDirty = oldValue != newValue && (
                oldValue == null ||
                !oldValue.equals(newValue)
                );
        dirty = dirty || attributeDirty;
        return attributeDirty;
    }

    /**
     * Set the dirty flag.
     */
    protected void setDirty() {
        dirty = true;
    }

}
