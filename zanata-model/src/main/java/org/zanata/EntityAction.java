package org.zanata;

/**
 * @author Patrick Huang <a
 *         href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
public enum EntityAction {
    READ,
    INSERT,
    UPDATE,
    DELETE;

    @Override
    public String toString() {
        return name().toLowerCase();
    }

}
