/*
 * Copyright 2014, Red Hat, Inc. and individual contributors as indicated by the
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

import com.google.common.base.Optional;
import lombok.extern.slf4j.Slf4j;
import net.sf.okapi.common.Event;
import net.sf.okapi.common.EventType;
import net.sf.okapi.common.exceptions.OkapiIOException;
import net.sf.okapi.common.filters.IFilter;
import net.sf.okapi.common.filterwriter.GenericContent;
import net.sf.okapi.common.filterwriter.IFilterWriter;
import net.sf.okapi.common.resource.RawDocument;
import net.sf.okapi.common.resource.StartSubDocument;
import net.sf.okapi.common.resource.TextUnit;
import net.sf.okapi.filters.ts.TsFilter;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.zanata.common.DocumentType;
import org.zanata.common.LocaleId;
import org.zanata.exception.FileFormatAdapterException;
import org.zanata.model.HDocument;
import org.zanata.rest.dto.resource.TextFlow;
import org.zanata.rest.dto.resource.TextFlowTarget;

import javax.annotation.Nonnull;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
/**
 * Adapter to handle Qt translation (.ts) files.<br/> using the
 * Okapi {@link net.sf.okapi.filters.ts.TsFilter} class
 *
 * @author Damian Jansen
 *         <a href="mailto:djansen@redhat.com">djansen@redhat.com</a>
 */
@Slf4j
public class TSAdapter extends OkapiFilterAdapter {

    public TSAdapter() {
        super(prepareFilter(), IdSource.contentHash, true);
    }

    private static TsFilter prepareFilter() {
        return new TsFilter();
    }

    @Override
    public String generateTranslationFilename(@Nonnull HDocument document, @Nonnull String locale) {
        String srcExt = FilenameUtils.getExtension(document.getName());
        DocumentType documentType = document.getRawDocument().getType();
        String transExt = documentType.getExtensions().get(srcExt);
        if (StringUtils.isEmpty(transExt)) {
            return document.getName() + "_" + locale + "." + transExt;
        }
        return FilenameUtils.removeExtension(document
                .getName()) + "_" + locale + "." + transExt;
    }

    @Override
    protected void generateTranslatedFile(URI originalFile,
                                          Map<String, TextFlowTarget> translations,
                                          net.sf.okapi.common.LocaleId localeId, IFilterWriter writer,
                                          Optional<String> params) {
        RawDocument rawDoc =
                new RawDocument(originalFile, "UTF-8",
                        net.sf.okapi.common.LocaleId.fromString("en"));
        if (rawDoc.getTargetLocale() == null) {
            rawDoc.setTargetLocale(localeId);
        }

        List<String> encounteredIds = new ArrayList<>();
        IFilter filter = getFilter();
        Event newLine = new Event();
        newLine.setEventType(EventType.CUSTOM);

        try {
            filter.open(rawDoc);
            String subDocName = "";
            while (filter.hasNext()) {
                Event event = filter.next();
                if (event.getEventType() == EventType.START_SUBDOCUMENT) {
                    log.info("Doing a start-sub");
                    StartSubDocument startSubDoc =
                            (StartSubDocument) event.getResource();
                    subDocName = stripPath(startSubDoc.getName());
                    writer.handleEvent(event);

                } else if (event.getEventType() == EventType.TEXT_UNIT) {
                    log.info("Doing a tu");
                    TextUnit tu = (TextUnit) event.getResource();
                    if (!tu.getSource().isEmpty() && tu.isTranslatable()) {
                        String translatable = GenericContent.fromFragmentToLetterCoded(
                                tu.getSource().getFirstContent(), true);
                        if (!translatable.isEmpty()) {
                            TextFlowTarget tft = translations.get(getIdFor(tu, translatable, subDocName));
                            if (tft != null) {
                                String id = getIdFor(tu, translatable, subDocName);
                                if(!encounteredIds.contains(id)) {
                                    encounteredIds.add(id);
                                    for (String translated : tft.getContents()) {
                                        tu.setTargetContent(localeId, GenericContent
                                                .fromLetterCodedToFragment(translated,
                                                        tu.getSource().getFirstContent().clone(), true, true));
                                        writer.handleEvent(event);
                                        writer.handleEvent(newLine);
                                    }
                                }
                            }
                        }
                    }

                } else {
                    log.info("Doing a {}", event.getEventType().toString());
                    writer.handleEvent(event);
                }
            }
        } catch (OkapiIOException e) {
            throw new FileFormatAdapterException(
                    "Unable to generate translated document from original", e);
        } finally {
            filter.close();
            writer.close();
        }
    }

    @Override
    protected TextFlow processTextFlow(TextUnit tu, String content, String subDocName, LocaleId sourceLocale) {
        TextFlow tf = new TextFlow(getIdFor(tu, content,
                subDocName), sourceLocale);
        if(tu.hasProperty("numerus") &&
                tu.getProperty("numerus").getValue().equals("yes")) {
            tf.setPlural(true);
            // Qt TS uses a single message for singular and plural form
            tf.setContents(content, content);
        } else {
            tf.setPlural(false);
            tf.setContents(content);
        }
        return tf;
    }

    private String stripPath(String name) {
        if (name.contains("/") && !name.endsWith("/")) {
            return name.substring(name.lastIndexOf('/') + 1);
        } else {
            return name;
        }
    }
}
