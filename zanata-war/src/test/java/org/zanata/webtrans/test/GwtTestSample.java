package org.zanata.webtrans.test;

import org.assertj.core.api.Assertions;

import com.google.gwt.junit.client.GWTTestCase;

public class GwtTestSample extends GWTTestCase {

    @Override
    public String getModuleName() {
        return "org.zanata.webtrans.ApplicationTest";
    }

    public void testSomething() {
        // Note: GWT test cases are very slow to run and should be
        // avoided wherever possible in favour of plain JUnit tests.
        // Only code that requires a DOM should be tested with these
        // (e.g. most view classes).
        Assertions.assertThat(true).isTrue();
    }
}
