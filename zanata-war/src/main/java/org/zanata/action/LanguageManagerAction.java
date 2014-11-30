/*
 * Copyright 2010, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata.action;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;
import javax.faces.model.SelectItem;

import lombok.Getter;
import lombok.Setter;

import org.apache.commons.lang.StringUtils;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.Create;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.annotations.security.Restrict;
import org.zanata.common.LocaleId;
import org.zanata.dao.LocaleDAO;
import org.zanata.model.HLocale;
import org.zanata.rest.service.ResourceUtils;
import org.zanata.service.LocaleService;
import org.zanata.ui.AbstractAutocomplete;
import org.zanata.ui.FilterUtil;
import org.zanata.ui.autocomplete.LocaleAutocomplete;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
import com.google.common.collect.Lists;
import com.ibm.icu.util.ULocale;

@Name("languageManagerAction")
@Scope(ScopeType.PAGE)
@Restrict("#{s:hasRole('admin')}")
public class LanguageManagerAction extends AbstractAutocomplete<HLocale>
        implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final int LENGTH_LIMIT = 254;

    @In
    private LocaleDAO localeDAO;

    @In
    private LocaleService localeServiceImpl;

    @In
    private ResourceUtils resourceUtils;

    @In
    private Map<String, String> msgs;

    @Getter
    @Setter
    private String language;

    @Getter
    @Setter
    private ULocale uLocale;

    @Getter
    private List<SelectItem> localeStringList;

    @Getter
    @Setter
    private boolean enabledByDefault = true;

    // cache this so it is called only once
    private List<LocaleId> allLocales;

    @Getter
    private String languageNameValidationMessage;

    @Getter
    private String languageNameWarningMessage;

    @Create
    public void onCreate() {
        fetchLocaleFromJava();
    }

    public void updateLanguage() {
        if (this.language.trim().length() > 0) {
            this.uLocale = new ULocale(this.language);
            this.isLanguageNameValid();
        } else {
            this.uLocale = null;
        }
    }

    public String save() {
        if (!isLanguageNameValid()) {
            return null; // not success
        }
        LocaleId locale = new LocaleId(language);
        localeServiceImpl.save(locale, enabledByDefault);
        return "success";
    }

    public void fetchLocaleFromJava() {
        List<LocaleId> locale = localeServiceImpl.getAllJavaLanguages();
        List<SelectItem> localeList = new ArrayList<SelectItem>();
        for (LocaleId var : locale) {
            SelectItem op = new SelectItem(var.getId(), var.getId());
            localeList.add(op);
        }
        localeStringList = localeList;
    }

    public boolean isLanguageNameValid() {
        this.languageNameValidationMessage = null; // reset
        this.languageNameWarningMessage = null; // reset

        if (StringUtils.isEmpty(language) || language.length() > LENGTH_LIMIT) {
            this.uLocale = null;
            this.languageNameValidationMessage =
                    msgs.get("jsf.language.validation.Invalid");
            return false;
        }

        // Cannot use FacesMessages as they are request scoped.
        // Cannot use UI binding as they don't work in Page scoped beans
        // TODO Use the new (since 1.7) FlashScopeBean

        // Check that locale Id is syntactically valid
        LocaleId localeId;
        try {
            localeId = new LocaleId(language);
        } catch (IllegalArgumentException iaex) {
            this.languageNameValidationMessage =
                    msgs.get("jsf.language.validation.Invalid");
            return false;
        }

        // check for already registered languages
        if (localeServiceImpl.localeExists(localeId)) {
            this.languageNameValidationMessage =
                    msgs.get("jsf.language.validation.Existing");
            return false;
        }

        // Check for plural forms
        if (resourceUtils.getPluralForms(localeId, false) == null) {
            this.languageNameWarningMessage =
                    msgs.get("jsf.language.validation.UnknownPluralForm");
        }

        // Check for similar already registered languages (warning)
        List<HLocale> similarLangs = localeDAO.findBySimilarLocaleId(localeId);
        if (similarLangs.size() > 0) {
            this.languageNameWarningMessage =
                    msgs.get("jsf.language.validation.SimilarLocaleFound")
                            + similarLangs.get(0).getLocaleId().getId();
        }

        return true;
    }

    @Override
    public List<HLocale> suggest() {
        if (StringUtils.isEmpty(getQuery())) {
            return Collections.EMPTY_LIST;
        }

        if (allLocales == null) {
            allLocales = localeServiceImpl.getAllJavaLanguages();
        }

        Collection<HLocale> locales = Collections2.transform(allLocales,
                new Function<LocaleId, HLocale>() {
                    @Override
                    public HLocale apply(@Nullable LocaleId from) {
                        return new HLocale(from);
                    }
                });

        Collection<HLocale> filtered =
                Collections2.filter(locales, new Predicate<HLocale>() {
                    @Override
                    public boolean apply(HLocale input) {
                        return StringUtils.startsWithIgnoreCase(input
                                .getLocaleId().getId(), getQuery());
                    }
                });
        if(filtered.isEmpty()) {
            language = getQuery();
            filtered = Lists.newArrayList(new HLocale(new LocaleId(language)));
            updateLanguage();
        }
        return Lists.newArrayList(filtered);
    }

    @Override
    public void onSelectItemAction() {
        if (StringUtils.isEmpty(getSelectedItem())) {
            return;
        }
        language = getSelectedItem();
        updateLanguage();
    }
}
