package org.zanata.ui;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public interface CopyAction {

    boolean isInProgress();

    String getProgressMessage();

    void onComplete();
}
