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
package org.zanata.action;

import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang.StringUtils;
import org.jboss.seam.faces.FacesMessages;
import org.jboss.seam.international.StatusMessage;
import org.jboss.seam.security.Identity;
import org.zanata.common.LocaleId;
import org.zanata.dao.LocaleDAO;
import org.zanata.i18n.Messages;
import org.zanata.model.HLocale;
import org.zanata.model.HProjectIteration;
import org.zanata.model.HasLanguages;
import org.zanata.service.LocaleService;
import org.zanata.service.impl.LocaleServiceImpl;
import org.zanata.util.ServiceLocator;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static com.google.common.base.Strings.isNullOrEmpty;

public abstract class LanguageSettingsHandler<E extends HasLanguages> implements HasLanguageSettings {

    // FIXME make sure to call getInstance().update() or whatever. May need to make abstract method update()
    //       so that it can pick up the special override thing that I recently added.


    /**
     * Restrict an operation to users who have permission to update the entity
     * that holds these language settings.
     *
     * This is provided as a convenience since the @Restrict annotation will
     * be ignored when called on non-bean methods. The implementation should
     * call a restricted bean method.
     */
    protected abstract void restrict();


    /**
     * Inject a dependency.
     *
     * @param clazz class of dependency to inject
     * @param <T> type of the dependency (should not need to be specified)
     * @return the injected dependency.
     */
    protected <T> T in(Class<T> clazz) {
        return ServiceLocator.instance().getInstance(clazz);
    }

    abstract E getInstance();

    abstract Messages msgs();

    abstract LocaleDAO getLocaleDAO();

    // FIXME if this is just used in 1 place, might as well have a method do that 1 thing rather than pass in the whole service
    LocaleService getLocaleService() {
        return in(LocaleServiceImpl.class);
    }

    abstract void update();


    // FIXME this should be handled completely by LanguageSettingsHandler, just need to change the EL to get  it.
    /**
     * A separate map is used, rather than binding the alias map from the
     * project directly. This is done so that empty values are not added to the
     * map in every form submission, and so that a value entered in the field
     * for a row is not automatically updated when a different row is submitted.
     */
    @Getter
    @Setter
    private Map<LocaleId, String> enteredLocaleAliases = Maps.newHashMap();

    @Override
    public boolean isOverrideLocales() {
        return getInstance().isOverrideLocales();
    }

    @Override
    public void setOverrideLocales(boolean overrideLocales) {
        getInstance().setOverrideLocales(overrideLocales);
    }

    @Override
    public abstract Map<LocaleId, String> getLocaleAliases();

    @Override
    public void removeAllLocaleAliases() {
        List<LocaleId> removed = new ArrayList<>();
        List<LocaleId> aliasedLocales =
                new ArrayList<>(getLocaleAliases().keySet());
        if (!aliasedLocales.isEmpty()) {
            ensureOverridingLocales();
            for (LocaleId aliasedLocale : aliasedLocales) {
                boolean hadAlias = removeAliasSilently(aliasedLocale);
                if (hadAlias) {
                    removed.add(aliasedLocale);
                }
            }
        }
        showRemovedAliasesMessage(removed);
    }

    // FIXME this had a restrict annotation. Can I put restrict annotations in here?
    //       The annotations are different for the two things, so I will need to wrap
    //       calls to this. At least the duplicate code is split off separately now.
    public void removeSelectedLocaleAliases() {
        List<LocaleId> removed = new ArrayList<>();
        for (Map.Entry<LocaleId, Boolean> entry :
                getSelectedEnabledLocales().entrySet()) {
            if (entry.getValue()) {
                boolean hadAlias = removeAliasSilently(entry.getKey());
                if (hadAlias) {
                    removed.add(entry.getKey());
                }
            }
        }
        showRemovedAliasesMessage(removed);
    }

    /**
     * Remove a locale alias without showing any message.
     *
     * @param localeId that will have its locale alias removed.
     * @return true if the locale had an alias, otherwise false.
     */
    private boolean removeAliasSilently(LocaleId localeId) {
        return setLocaleAliasSilently(localeId, "");
    }

    @Override
    public void showRemovedAliasesMessage(List<LocaleId> removed) {
        if (removed.isEmpty()) {
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().get("jsf.LocaleAlias.NoAliasesToRemove"));
        } else if (removed.size() == 1) {
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().format("jsf.LocaleAlias.AliasRemoved", removed.get(0)));
        } else {
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().format("jsf.LocaleAlias.AliasesRemoved", StringUtils.join(removed, ", ")));
        }
    }

    @Override
    public String getLocaleAlias(HLocale locale) {
        return getLocaleAliases().get(locale.getLocaleId());
    }

    @Override
    public boolean hasLocaleAlias(HLocale locale) {
        return getLocaleAliases().containsKey(locale.getLocaleId());
    }

    // FIXME must wrap in restriction
    @Override
    public void updateToEnteredLocaleAlias(LocaleId localeId) {
        String enteredAlias = enteredLocaleAliases.get(localeId);
        setLocaleAlias(localeId, enteredAlias);
    }

    private void setLocaleAlias(LocaleId localeId, String alias) {
        boolean hadAlias = setLocaleAliasSilently(localeId, alias);
        if (isNullOrEmpty(alias)) {
            if (hadAlias) {
                FacesMessages.instance().add(StatusMessage.Severity.INFO,
                        msgs().format("jsf.LocaleAlias.AliasRemoved", localeId));
            } else {
                FacesMessages.instance().add(StatusMessage.Severity.INFO,
                        msgs().format("jsf.LocaleAlias.NoAliasToRemove", localeId));
            }
        } else {
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().format("jsf.LocaleAlias.AliasSet", localeId, alias));
        }
    }

    /**
     * Set or remove a locale alias without showing any message.
     *
     * @param localeId for which to set alias
     * @param alias new alias to use. Use empty string to remove alias.
     * @return true if there was already an alias, otherwise false.
     */
    private boolean setLocaleAliasSilently(LocaleId localeId, String alias) {
        E instance = getInstance();
        Map<LocaleId, String> aliases = instance.getLocaleAliases();

        boolean hadAlias = aliases.containsKey(localeId);
        if (isNullOrEmpty(alias)) {
            if (hadAlias) {
                ensureOverridingLocales();
                aliases.remove(localeId);
            }
        } else {
            final boolean sameAlias = hadAlias && alias.equals(aliases.get(localeId));
            if (!sameAlias) {
                ensureOverridingLocales();
                aliases.put(localeId, alias);
            }
        }
        return hadAlias;
    }

    @Getter
    @Setter
    private String enabledLocalesFilter = "";

    @Getter
    @Setter
    private Map<LocaleId, Boolean> selectedEnabledLocales = Maps.newHashMap();

    // TODO remove this and see if it works with just a default one.
    //      It seems to work ok on selected disabled locales without this.
    public Map<LocaleId, Boolean> getSelectedEnabledLocales() {
        if (selectedEnabledLocales == null) {
            selectedEnabledLocales = Maps.newHashMap();
            for (HLocale locale : getEnabledLocales()) {
                selectedEnabledLocales.put(locale.getLocaleId(), Boolean.FALSE);
            }
        }
        return selectedEnabledLocales;
    }

    // TODO wrap in security restriction
    @Override
    public void disableSelectedLocales() {
        List<LocaleId> removed = new ArrayList<>();
        for (Map.Entry<LocaleId, Boolean> entry :
                getSelectedEnabledLocales().entrySet()) {
            if (entry.getValue()) {
                boolean wasEnabled = disableLocaleSilently(entry.getKey());
                if (wasEnabled) {
                    removed.add(entry.getKey());
                }
            }
        }
        selectedEnabledLocales.clear();

        if (removed.isEmpty()) {
            // This should not be possible in the UI, but maybe if multiple users are editing it.
        } else if (removed.size() == 1) {
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().format("jsf.languageSettings.LanguageDisabled", removed.get(0)));
        } else {
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().format("jsf.languageSettings.LanguagesDisabled", StringUtils.join(removed, ", ")));
        }
    }

    // TODO wrap in restrictions
    @Override
    public void disableLocale(HLocale locale) {
        boolean wasEnabled = disableLocaleSilently(locale);
        if (wasEnabled) {
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().format("jsf.languageSettings.LanguageDisabled",
                            locale.getLocaleId()));
        }
        // TODO consider showing a message like "Locale {0} was already disabled."
        // TODO consider showing a message regardless whether it was enabled, just stating that it is disabled now.
    }

    private boolean disableLocaleSilently(LocaleId localeId) {
        HLocale locale = getLocaleService().getByLocaleId(localeId);
        return disableLocaleSilently(locale);
    }

    /**
     * Disable a locale without printing any message.
     *
     * @param locale to disable
     * @return true if the locale was enabled before this call, false otherwise.
     */
    private boolean disableLocaleSilently(HLocale locale) {
        boolean wasEnabled;
        if (getEnabledLocales().contains(locale)) {
            ensureOverridingLocales();
            wasEnabled = getInstance().getCustomizedLocales().remove(locale);
            // TODO look up alias of parent rather than use none (may require custom methods)
            getLocaleAliases().remove(locale.getLocaleId());
            refreshDisabledLocales();
            update();
        } else {
            wasEnabled = false;
        }
        return wasEnabled;
    }

    @Getter
    @Setter
    private String disabledLocalesFilter;

    @Getter
    @Setter
    private Map<LocaleId, Boolean> selectedDisabledLocales = Maps.newHashMap();

    // TODO wrap in restriction method
    @Override
    public void enableSelectedLocales() {
        List<LocaleId> enabled = new ArrayList<>();
        for (Map.Entry<LocaleId, Boolean> entry : selectedDisabledLocales
                .entrySet()) {
            if (entry.getValue()) {
                boolean wasDisabled = enableLocaleSilently(entry.getKey());
                if (wasDisabled) {
                    enabled.add(entry.getKey());
                }
            }
        }
        selectedDisabledLocales.clear();

        if (enabled.isEmpty()) {
            // This should not be possible in the UI, but maybe if multiple users are editing it.
        } else if (enabled.size() == 1) {
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().format("jsf.languageSettings.LanguageEnabled", enabled.get(0)));
        } else {
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().format("jsf.languageSettings.LanguagesEnabled", StringUtils.join(enabled, ", ")));
        }
    }


    // TODO wrap in restriction method
    @Override
    public void enableLocale(HLocale locale) {
        boolean wasDisabled = enableLocaleSilently(locale);

        if (wasDisabled) {
            LocaleId localeId = locale.getLocaleId();
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                    msgs().format("jsf.languageSettings.LanguageEnabled", localeId));
        }
        // TODO consider printing message like "Locale {0} was already enabled"
        // TODO consider printing an idempotent message just saying that it is enabled now.
    }

    private boolean enableLocaleSilently(LocaleId localeId) {
        // FIXME locale service may only be used to get locale by id. Replace with get locale by id.
        HLocale locale = getLocaleService().getByLocaleId(localeId);
        return enableLocaleSilently(locale);
    }

    /**
     * Enable a given locale without printing any message.
     *
     * @param locale locale that should be enabled.
     * @return false if the locale was already enabled, true otherwise.
     */
    private boolean enableLocaleSilently(HLocale locale) {
        final boolean wasDisabled = getDisabledLocales().contains(locale);
        if (wasDisabled) {
            ensureOverridingLocales();
            getInstance().getCustomizedLocales().add(locale);
            refreshDisabledLocales();
            update();
        }
        // else locale already enabled, nothing to do.
        return wasDisabled;
    }

    /**
     * Ensure that isOverrideLocales is true, and copy data if necessary.
     */
    private void ensureOverridingLocales() {
        if (!isOverrideLocales()) {
            startOverridingLocales();
        }
    }

    /**
     * Make locale copies of inherited locale data and set overrideLocales, in
     * preparation for making customizations to the locales.
     */
    private void startOverridingLocales() {
        // Copied before setOverrideLocales(true) so that the currently returned
        // values will be used as the basis for any customization.
        List<HLocale> enabledLocales = getEnabledLocales();
        Map<LocaleId, String> localeAliases = getLocaleAliases();

        setOverrideLocales(true);

        // Replace contents rather than entire collections to avoid confusion
        // with reference to the collections that are bound before this runs.

        getInstance().getCustomizedLocales().clear();
        getInstance().getCustomizedLocales().addAll(enabledLocales);

        getInstance().getLocaleAliases().clear();
        getInstance().getLocaleAliases().putAll(localeAliases);

        enteredLocaleAliases.clear();
        enteredLocaleAliases.putAll(localeAliases);

        refreshDisabledLocales();
    }

    private List<HLocale> disabledLocales;

    public List<HLocale> getDisabledLocales() {
        if(disabledLocales == null) {
            disabledLocales = findActiveNotEnabledLocales();
        }
        return disabledLocales;
    }

    /**
     * Update disabled locales to be consistent with enabled locales.
     */
    private void refreshDisabledLocales() {
        // will be re-generated with correct values next time it is fetched.
        disabledLocales = null;
    }

    /**
     * Populate the list of available locales after filtering out the locales
     * already in the project.
     */
    private List<HLocale> findActiveNotEnabledLocales() {
        Collection<HLocale> filtered =
                Collections2.filter(getLocaleDAO().findAllActive(),
                        new Predicate<HLocale>() {
                            @Override
                            public boolean apply(HLocale input) {
                                // only include those not already in the project
                                return !getEnabledLocales().contains(input);
                            }
                        });
        return Lists.newArrayList(filtered);
    }

}
