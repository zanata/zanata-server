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

/**
 * Utility class for File
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public class FileUtil {

    /**
     *
     * @param fileNameOrExtension
     * @return the extension for a given filename, or the extension that was
     *         passed in
     */
    public static String extractExtension(String fileNameOrExtension) {
        if (fileNameOrExtension == null || fileNameOrExtension.length() == 0
            || fileNameOrExtension.endsWith(".")) {
            // could throw exception here
            return null;
        }

        String extension;
        if (fileNameOrExtension.contains(".")) {
            extension =
                fileNameOrExtension.substring(fileNameOrExtension
                    .lastIndexOf('.') + 1);
        } else {
            extension = fileNameOrExtension;
        }
        return extension;
    }


    /**
     * Generate documentId by concatenating path with fileName
     *
     * e.g "foo", "bar.txt" = "foo/bar.txt"
     *
     * @param path
     * @param fileName
     * @return
     */
    public static String generateDocId(String path, String fileName) {
        String docName = fileName;
        if (docName.endsWith(".pot")) {
            docName = docName.substring(0, docName.lastIndexOf('.'));
        }
        return convertToValidPath(path) + docName;
    }

    /**
     * A valid path is either empty, or has a trailing slash and no leading
     * slash.
     *
     * @param path
     * @return valid path
     */
    public static String convertToValidPath(String path) {
        path = path.trim();
        while (path.startsWith("/")) {
            path = path.substring(1);
        }
        if (path.length() > 0 && !path.endsWith("/")) {
            path = path.concat("/");
        }
        return path;
    }
}
