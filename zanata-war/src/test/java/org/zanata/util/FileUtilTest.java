/*
 * Copyright 2015, Red Hat, Inc. and individual contributors as indicated by the
 * @author tags. See the copyright.txt file in the distribution for a full
 * listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */

package org.zanata.util;

import org.testng.annotations.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Test(groups = { "unit-tests" })
public class FileUtilTest {

    // FIXME this is the current behaviour, but doesn't seem sensible
    @Test
    public void extractExtensionFromPlainFilenameCurrentBehaviour() {
        assertThat(FileUtil.extractExtension("foobar"), is("foobar"));
    }

    @Test(enabled = false, description = "enable this test once extractExtensionFromPlainFilenameCurrentBehaviour is fixed")
    public void extractExtensionFromPlainFilenameBetterBehaviour() {
        assertThat(FileUtil.extractExtension("foobar"), is(""));
    }

    @Test
    public void extractNormalExtension() {
        assertThat(FileUtil.extractExtension("file.txt"), is("txt"));
    }

    @Test
    public void extractExtensionWithMultipleDots() {
        assertThat(FileUtil.extractExtension("foo.bar.txt"), is("txt"));
    }

    @Test
    public void extractFromSQLInjection() {
        String extension =
            FileUtil
                .extractExtension("file.txt;DROP ALL OBJECTS;other.txt");
        assertThat(extension, is("txt"));
    }

    @Test
    public void generateSimpleDocId() {
        assertThat(FileUtil.generateDocId("foo", "bar.txt"),
            is("foo/bar.txt"));
    }

    @Test
    public void generateSQLInjectionDocId() {
        String sqlInjectFilename = "file.txt;DROP ALL OBJECTS;other.txt";
        assertThat(FileUtil.generateDocId("", sqlInjectFilename),
            is(sqlInjectFilename));
    }
}
