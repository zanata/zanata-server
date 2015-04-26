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

package org.zanata.adapter;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

import org.apache.commons.lang.StringUtils;
import org.zanata.adapter.properties.PropReader;
import org.zanata.adapter.properties.PropWriter;
import org.zanata.common.ContentState;
import org.zanata.common.LocaleId;
import org.zanata.exception.FileFormatAdapterException;
import org.zanata.rest.dto.resource.Resource;
import org.zanata.rest.dto.resource.TranslationsResource;

import com.google.common.base.Charsets;
import com.google.common.base.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * Adapter for reading and write {@link org.zanata.common.DocumentType#PROPERTIES} file
 *
 * TODO: Convert to okapi properties adapter once all client conversion is
 * migrated to server
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Slf4j
public class PropertiesAdapter implements FileFormatAdapter {

    public static final String ISO_8859_1 = Charsets.ISO_8859_1.name();

    public static final String UTF_8 = Charsets.UTF_8.name();

    @Override
    public Resource parseDocumentFile(URI fileUri, LocaleId sourceLocale,
        Optional<String> filterParams) throws FileFormatAdapterException,
        IllegalArgumentException {

        return parseDocumentFile(fileUri, sourceLocale, filterParams,
            ISO_8859_1);
    }

    @Override
    public TranslationsResource parseTranslationFile(URI fileUri,
        String localeId, Optional<String> params)
        throws FileFormatAdapterException, IllegalArgumentException {

        return parseTranslationFile(fileUri, localeId, params, ISO_8859_1);
    }

    @Override
    public void writeTranslatedFile(OutputStream output, URI originalFile,
        Resource resource, TranslationsResource translationsResource,
        String locale, Optional<String> params)
        throws FileFormatAdapterException, IllegalArgumentException {

        writeTranslatedFile(output, resource, translationsResource, locale,
                params, ISO_8859_1);
    }

    public Resource parseDocumentFile(URI fileUri, LocaleId sourceLocale,
        Optional<String> filterParams, String charset) throws FileFormatAdapterException,
        IllegalArgumentException {

        if (sourceLocale == null) {
            throw new IllegalArgumentException("Source locale cannot be null");
        }

        if (fileUri == null) {
            throw new IllegalArgumentException("Document URI cannot be null");
        }

        PropReader propReader = new PropReader(charset, sourceLocale,
            ContentState.Approved);

        BufferedInputStream inputStream = null;
        Resource doc = new Resource();

        try {
            inputStream = readStream(fileUri);
            propReader.extractTemplate(doc, inputStream);
        } catch (IOException e) {
            throw new FileFormatAdapterException(
                "Could not open the URL. The URL is OK but the input stream could not be opened.\n"
                    + e.getMessage(), e);
        } finally {
            try {
                inputStream.close();
            } catch (IOException e1) {
            }
        }
        return doc;
    }

    public TranslationsResource parseTranslationFile(URI fileUri,
        String localeId, Optional<String> params, String charset)
        throws FileFormatAdapterException, IllegalArgumentException {

        if (StringUtils.isEmpty(localeId)) {
            throw new IllegalArgumentException(
                "locale id string cannot be null or empty");
        }

        PropReader propReader = new PropReader(charset, LocaleId.EN_US,
            ContentState.Approved);

        BufferedInputStream inputStream = null;

        /**
         * Resource is not needed for properties file translation parser
         * as its only used for contentHash check
         */
        Resource srcDoc = new Resource();

        TranslationsResource targetDoc = new TranslationsResource();

        try {
            inputStream = readStream(fileUri);
            propReader.extractTarget(targetDoc, inputStream, srcDoc);
        } catch (IOException e) {
            throw new FileFormatAdapterException(
                "Could not open the URL. The URL is OK but the input stream could not be opened.\n"
                    + e.getMessage(), e);
        } finally {
            try {
                inputStream.close();
            } catch (IOException e1) {
            }
        }
        return targetDoc;
    }

    public void writeTranslatedFile(OutputStream output, Resource resource,
        TranslationsResource translationsResource, String locale,
        Optional<String> params, String charset)
        throws FileFormatAdapterException, IllegalArgumentException {

        //write source string with empty translation
        boolean createSkeletons = true;

        File tempFile = null;
        try {
            tempFile = File.createTempFile("filename", "extension");
            if(charset.equals(ISO_8859_1)) {
                PropWriter.writeTranslationsFile(resource,
                        translationsResource, tempFile,
                        PropWriter.CHARSET.Latin1, createSkeletons);
            } else if (charset.equals(UTF_8)) {
                PropWriter.writeTranslationsFile(resource,
                    translationsResource,
                    tempFile, PropWriter.CHARSET.UTF8, createSkeletons);
            }

            byte[] buffer = new byte[4096]; // To hold file contents
            int bytesRead;
            FileInputStream input = new FileInputStream(tempFile);
            while ((bytesRead = input.read(buffer)) != -1) {
                output.write(buffer, 0, bytesRead);
            }
        } catch (IOException e) {
            throw new FileFormatAdapterException(
                "Unable to generate translated file", e);
        } finally {
            if (tempFile != null) {
                if (!tempFile.delete()) {
                    log.warn(
                        "unable to remove temporary file {}, marked for delete on exit",
                        tempFile.getAbsolutePath());
                    tempFile.deleteOnExit();
                }
            }
        }
    }

    private BufferedInputStream readStream(URI fileUri) throws FileFormatAdapterException,
            IllegalArgumentException {
        URL url = null;

        try {
            url = fileUri.toURL();
            return new BufferedInputStream(url.openStream());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Could not open the URI. The URI must be absolute: "
                    + ((url == null) ? "URL is null" : url.toString()),
                e);
        } catch (MalformedURLException e) {
            throw new FileFormatAdapterException(
                "Could not open the URI. The URI may be malformed: "
                    + ((url == null) ? "URL is null" : url.toString()),
                e);
        } catch (IOException e) {
            throw new FileFormatAdapterException(
                "Could not open the URL. The URL is OK but the input stream could not be opened.\n"
                    + e.getMessage(), e);
        }
    }
}
