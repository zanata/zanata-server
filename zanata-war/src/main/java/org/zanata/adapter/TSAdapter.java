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
import net.sf.okapi.common.resource.TextContainer;
import net.sf.okapi.common.resource.TextUnit;
import net.sf.okapi.filters.ts.TsFilter;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.zanata.common.ContentState;
import org.zanata.common.DocumentType;
import org.zanata.common.HasContents;
import org.zanata.common.LocaleId;
import org.zanata.exception.FileFormatAdapterException;
import org.zanata.model.HDocument;
import org.zanata.rest.dto.resource.TextFlow;
import org.zanata.rest.dto.resource.TextFlowTarget;
import org.zanata.rest.dto.resource.TranslationsResource;

import javax.annotation.Nonnull;

import java.net.URI;
import java.util.HashMap;
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
        try {
            filter.open(rawDoc);
            String subDocName = "";
            while (filter.hasNext()) {
                Event event = filter.next();
                if (event.getEventType() == EventType.START_SUBDOCUMENT) {
                    StartSubDocument startSubDoc =
                            (StartSubDocument) event.getResource();
                    subDocName = stripPath(startSubDoc.getName());
                    writer.handleEvent(event);

                } else if (event.getEventType() == EventType.TEXT_UNIT) {
                    TextUnit tu = (TextUnit) event.getResource();
                    if (!tu.getSource().isEmpty() && tu.isTranslatable()) {
                        String translatable = getTranslatableText(tu);
                        // Ignore if the source is empty
                        if (!translatable.isEmpty()) {
                            String id = getIdFor(tu, translatable, subDocName);
                            TextFlowTarget tft = translations.get(id);
                            if (tft != null) {
                                if(!encounteredIds.contains(id)) {
                                    // Dismiss duplicate numerusforms
                                    encounteredIds.add(id);
                                    for (String translated : tft.getContents()) {
                                        // TODO: Find a method of doing this in one object, not a loop
                                        tu.setTargetContent(localeId, GenericContent
                                                .fromLetterCodedToFragment(translated,
                                                    tu.getSource().getFirstContent().clone(),
                                                    true, true));
                                        writer.handleEvent(event);
                                    }
                                }
                            } else {
                                writer.handleEvent(event);
                            }
                        }
                    }

                } else {
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
    protected String getTranslatableText(TextUnit tu) {
        return tu.getSource().getFirstContent().getText();
    }

    private String getTranslatedText(TextContainer tc) {
        return tc.getFirstContent().getText();
    }

    @Override
    protected TextFlow processTextFlow(TextUnit tu, String content, String subDocName, LocaleId sourceLocale) {
        TextFlow tf = new TextFlow(getIdFor(tu, content,
                subDocName), sourceLocale);
        if(tu.hasProperty("numerus") &&
                tu.getProperty("numerus").getValue().equalsIgnoreCase("yes")) {
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

    @Override
    protected TranslationsResource parseTranslationFile(RawDocument rawDoc,
                                                        Optional<String> params) {
        TranslationsResource transRes = new TranslationsResource();
        List<TextFlowTarget> translations = transRes.getTextFlowTargets();

        Map<String, HasContents> addedResources =
                new HashMap<String, HasContents>();
        IFilter filter = getFilter();

        try {
            filter.open(rawDoc);
            String subDocName = "";
            while (filter.hasNext()) {
                Event event = filter.next();
                if (event.getEventType() == EventType.START_SUBDOCUMENT) {
                    StartSubDocument startSubDoc =
                            (StartSubDocument) event.getResource();
                    subDocName = stripPath(startSubDoc.getName());
                } else if (event.getEventType() == EventType.TEXT_UNIT) {
                    TextUnit tu = (TextUnit) event.getResource();
                    if (!tu.getSource().isEmpty() && tu.isTranslatable()) {
                        String content = getTranslatableText(tu);
                        TextContainer translation = tu.getTarget(rawDoc.getTargetLocale());
                        if (!content.isEmpty()) {
                            TextFlowTarget tft =
                                    new TextFlowTarget(getIdFor(tu, content, subDocName));
                            // TODO: Change this
                            tft.setState(ContentState.NeedReview);
                            String resId = tft.getResId();
                            if (addedResources.containsKey(resId)) {
                                List<String> currentStrings = new ArrayList<>(addedResources.get(resId).getContents());
                                currentStrings.add(getTranslatedText(translation));
                                tft.setContents(currentStrings);
                            } else {
                                tft.setContents(getTranslatedText(translation));
                            }
                            addedResources.put(tft.getResId(), tft);
                            translations.add(tft);
                        }
                    }
                }
            }
        } catch (OkapiIOException e) {
            throw new FileFormatAdapterException(
                    "Unable to parse translation file", e);
        } finally {
            filter.close();
        }
        return transRes;
    }
}
