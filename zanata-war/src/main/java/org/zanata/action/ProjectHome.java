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

import static com.google.common.base.Strings.isNullOrEmpty;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.Set;

import javax.faces.application.FacesMessage;
import javax.faces.event.ValueChangeEvent;
import javax.persistence.EntityManager;
import javax.persistence.EntityNotFoundException;

import com.google.common.base.Predicate;
import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Collections2;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.Iterables;
import com.google.common.collect.ListMultimap;
import com.google.common.collect.SetMultimap;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang.StringUtils;
import org.hibernate.Session;
import org.hibernate.criterion.NaturalIdentifier;
import org.hibernate.criterion.Restrictions;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.jboss.seam.annotations.security.Restrict;
import org.jboss.seam.faces.FacesManager;
import org.jboss.seam.faces.Redirect;
import org.zanata.seam.security.ZanataJpaIdentityStore;
import org.zanata.common.EntityStatus;
import org.zanata.common.LocaleId;
import org.zanata.common.ProjectType;
import org.zanata.dao.AccountRoleDAO;
import org.zanata.dao.LocaleDAO;
import org.zanata.dao.PersonDAO;
import org.zanata.dao.WebHookDAO;
import org.zanata.i18n.Messages;
import org.zanata.model.HAccount;
import org.zanata.model.HAccountRole;
import org.zanata.model.HLocale;
import org.zanata.model.HPerson;
import org.zanata.model.HProject;
import org.zanata.model.HProjectIteration;
import org.zanata.model.HProjectLocaleMember;
import org.zanata.model.HProjectMember;
import org.zanata.model.LocaleRole;
import org.zanata.model.PersonProjectMemberships;
import org.zanata.model.ProjectRole;
import org.zanata.model.WebHook;
import org.zanata.model.validator.SlugValidator;
import org.zanata.security.ZanataIdentity;
import org.zanata.service.GravatarService;
import org.zanata.service.LocaleService;
import org.zanata.service.SlugEntityService;
import org.zanata.service.ValidationService;
import org.zanata.ui.AbstractListFilter;
import org.zanata.ui.InMemoryListFilter;
import org.zanata.ui.autocomplete.MaintainerAutocomplete;
import org.zanata.ui.faces.FacesMessages;
import org.zanata.util.CommonMarkRenderer;
import org.zanata.util.ComparatorUtil;
import org.zanata.util.ServiceLocator;
import org.zanata.util.UrlUtil;
import org.zanata.webtrans.shared.model.ValidationAction;
import org.zanata.webtrans.shared.model.ValidationId;
import org.zanata.webtrans.shared.validation.ValidationFactory;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import static javax.faces.application.FacesMessage.SEVERITY_ERROR;

@Name("projectHome")
@Slf4j
public class ProjectHome extends SlugHome<HProject> implements
    HasLanguageSettings {

    private static final long serialVersionUID = 1L;

    /**
     * This field is set from http parameter which will be the original slug
     */
    @Getter
    private String slug;

    /**
     * This field is set from form input which can differ from original slug
     */
    @Getter
    @Setter
    private String inputSlugValue;

    @Setter
    @Getter
    private Long projectId;

    @In
    private ZanataIdentity identity;

    @In(required = false, value = ZanataJpaIdentityStore.AUTHENTICATED_USER)
    private HAccount authenticatedAccount;

    @In
    private LocaleService localeServiceImpl;

    @In
    private LocaleDAO localeDAO;

    @In
    private SlugEntityService slugEntityServiceImpl;

    @In("commonMarkRenderer")
    private CommonMarkRenderer renderer;

    @In
    private EntityManager entityManager;

    @In("jsfMessages")
    private FacesMessages facesMessages;

    @In
    private Messages msgs;

    @In
    private PersonDAO personDAO;

    @In
    private AccountRoleDAO accountRoleDAO;

    @In
    private WebHookDAO webHookDAO;

    @In
    private ValidationService validationServiceImpl;

    @In
    private CopyTransOptionsModel copyTransOptionsModel;

    @In
    private UrlUtil urlUtil;

    // This property is present to keep the filter in place when the region with
    // the filter box is refreshed.
    @Getter
    @Setter
    private String enabledLocalesFilter = "";

    @Getter
    @Setter
    private String disabledLocalesFilter;

    /**
     * A separate map is used, rather than binding the alias map from the
     * project directly. This is done so that empty values are not added to the
     * map in every form submission, and so that a value entered in the field
     * for a row is not automatically updated when a different row is submitted.
     */
    @Getter
    @Setter
    private Map<LocaleId, String> enteredLocaleAliases = Maps.newHashMap();

    @Getter
    @Setter
    private Map<LocaleId, Boolean> selectedEnabledLocales = Maps.newHashMap();

    // Not sure if this is necessary, seems to work ok on selected disabled
    // locales without this.
    public Map<LocaleId, Boolean> getSelectedEnabledLocales() {
        if (selectedEnabledLocales == null) {
            selectedEnabledLocales = Maps.newHashMap();
            for (HLocale locale : getEnabledLocales()) {
                selectedEnabledLocales.put(locale.getLocaleId(), Boolean.FALSE);
            }
        }
        return selectedEnabledLocales;
    }

    @Getter
    @Setter
    private Map<LocaleId, Boolean> selectedDisabledLocales = Maps.newHashMap();

    @Getter
    @Setter
    private Boolean selectedCheckbox = Boolean.TRUE;

    private List<HLocale> disabledLocales;

    public List<HLocale> getDisabledLocales() {
        if(disabledLocales == null) {
            disabledLocales = findActiveNotEnabledLocales();
        }
        return disabledLocales;
    }

    /**
     * Populate the list of available locales after filtering out the locales
     * already in the project.
     */
    private List<HLocale> findActiveNotEnabledLocales() {
        Collection<HLocale> filtered =
                Collections2.filter(localeDAO.findAllActive(),
                        new Predicate<HLocale>() {
                            @Override
                            public boolean apply(HLocale input) {
                                // only include those not already in the project
                                return !getEnabledLocales().contains(input);
                            }
                        });
        return Lists.newArrayList(filtered);
    }

    private Map<String, Boolean> roleRestrictions;

    private Map<ValidationId, ValidationAction> availableValidations = Maps
            .newHashMap();


    @Getter(lazy = true)
    private final List<HProjectIteration> versions = fetchVersions();

    @Getter
    @Setter
    private String selectedProjectType;

    @Getter
    private ProjectMaintainersAutocomplete maintainerAutocomplete =
            new ProjectMaintainersAutocomplete();

    @Getter
    private AbstractListFilter<HPerson> maintainerFilter =
            new InMemoryListFilter<HPerson>() {
                @Override
                protected List<HPerson> fetchAll() {
                    return getInstanceMaintainers();
                }

                @Override
                protected boolean include(HPerson elem, String filter) {
                    return StringUtils.containsIgnoreCase(elem.getName(),
                            filter);
                }
            };

    public void createNew() {
        identity.checkPermission(getInstance(), "insert");
        getInstance().setDefaultProjectType(ProjectType.File);
        selectedProjectType = getInstance().getDefaultProjectType().name();
        enteredLocaleAliases.putAll(getLocaleAliases());
        // force get so it will create and populate the hashmap
        getSelectedEnabledLocales();
    }

    public void updateSelectedProjectType(ValueChangeEvent e) {
        selectedProjectType = (String) e.getNewValue();
        updateProjectType();
    }

    public void setSelectedProjectType(String selectedProjectType) {
        if (!StringUtils.isEmpty(selectedProjectType)
                && !selectedProjectType.equals("null")) {
            ProjectType projectType = ProjectType.valueOf(selectedProjectType);
            getInstance().setDefaultProjectType(projectType);
        } else {
            getInstance().setDefaultProjectType(null);
        }
    }

    public boolean isOverrideLocales() {
        return getInstance().isOverrideLocales();
    }

    public void setOverrideLocales(boolean overrideLocales) {
        getInstance().setOverrideLocales(overrideLocales);
    }

    /**
     * Return the list of enabled locales for this project, which may be
     * inherited from global locales. If the project slug is empty, all the
     * enabled locales for the server are returned.
     */
    public List<HLocale> getEnabledLocales() {
        List<HLocale> locales;
        if (StringUtils.isNotEmpty(getSlug())) {
            locales =
                    localeServiceImpl.getSupportedLanguageByProject(getSlug());
        } else {
            locales = localeServiceImpl.getSupportedAndEnabledLocales();
        }
        Collections.sort(locales, ComparatorUtil.LOCALE_COMPARATOR);
        return locales;
    }

    public Map<LocaleId, String> getLocaleAliases() {
        return getInstance().getLocaleAliases();
    }

    private void setLocaleAliases(Map<LocaleId, String> localeAliases) {
        getInstance().setLocaleAliases(localeAliases);
    }

    /**
     * Return the locale alias for the given locale in this project, if it
     * exists, otherwise null.
     */
    public String getLocaleAlias(HLocale locale) {
        return getLocaleAliases().get(locale.getLocaleId());
    }

    /**
     * Return true if the given locale has an alias, otherwise false.
     */
    public boolean hasLocaleAlias(HLocale locale) {
        return getLocaleAliases().containsKey(locale.getLocaleId());
    }

    /**
     * Set or remove a locale alias based on form input.
     *
     * Uses value from enteredLocaleAlias. If the value is null or empty, the
     * alias (if any) is removed for the given locale, otherwise the alias is
     * replaced with the value.
     */
    public void updateToEnteredLocaleAlias(LocaleId localeId) {
        identity.checkPermission(instance, "update");
        String enteredAlias = enteredLocaleAliases.get(localeId);
        setLocaleAlias(localeId, enteredAlias);
    }

    private void setLocaleAlias(LocaleId localeId, String alias) {
        boolean hadAlias = setLocaleAliasSilently(localeId, alias);
        if (isNullOrEmpty(alias)) {
            if (hadAlias) {
                facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                        msgs.format("jsf.LocaleAlias.AliasRemoved", localeId));
            } else {
                facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                        msgs.format("jsf.LocaleAlias.NoAliasToRemove",
                                localeId));
            }
        } else {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.LocaleAlias.AliasSet", localeId, alias));
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
        HProject instance = getInstance();
        Map<LocaleId, String> aliases = instance.getLocaleAliases();
        boolean hadAlias = aliases.containsKey(localeId);
        if (isNullOrEmpty(alias)) {
            if (hadAlias) {
                // no need to ensure overriding locales, aliases are independent
                aliases.remove(localeId);
            }
        } else {
            final boolean sameAlias = hadAlias && alias.equals(aliases.get(localeId));
            if (!sameAlias) {
                // no need to ensure overriding locales, aliases are independent
                aliases.put(localeId, alias);
            }
        }
        update();
        return hadAlias;
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

    public void removeSelectedLocaleAliases() {
        identity.checkPermission(instance, "update");
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

    public void removeAllLocaleAliases() {
        identity.checkPermission(instance, "update");
        List<LocaleId> removed = new ArrayList<>();
        List<LocaleId> aliasedLocales =
                new ArrayList<>(getLocaleAliases().keySet());
        for (LocaleId aliasedLocale : aliasedLocales) {
            boolean hadAlias = removeAliasSilently(aliasedLocale);
            if (hadAlias) {
                removed.add(aliasedLocale);
            }
        }
        showRemovedAliasesMessage(removed);
    }

    /**
     * Show an appropriate message for the removal of aliases from locales
     * with the given IDs.
     *
     * @param removed ids of locales that had aliases removed
     */
    private void showRemovedAliasesMessage(List<LocaleId> removed) {
        if (removed.isEmpty()) {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.get("jsf.LocaleAlias.NoAliasesToRemove"));
        } else if (removed.size() == 1) {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.LocaleAlias.AliasRemoved", removed.get(0)));
        } else {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.LocaleAlias.AliasesRemoved",
                            StringUtils.join(removed, ", ")));
        }
    }

    public void disableLocale(HLocale locale) {
        identity.checkPermission(instance, "update");
        disableLocaleSilently(locale);
        facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                msgs.format("jsf.languageSettings.LanguageDisabled",
                        locale.getLocaleId()));
    }


    public void disableSelectedLocales() {
        identity.checkPermission(instance, "update");
        List<LocaleId> removedLocales = new ArrayList<>();
        for (Map.Entry<LocaleId, Boolean> entry :
                getSelectedEnabledLocales().entrySet()) {
            if (entry.getValue()) {
                boolean wasEnabled = disableLocaleSilently(entry.getKey());
                if (wasEnabled) {
                    removedLocales.add(entry.getKey());
                }
            }
        }
        selectedEnabledLocales.clear();

        if (removedLocales.isEmpty()) {
            // This should not be possible in the UI, but maybe if multiple users are editing it.
        } else if (removedLocales.size() == 1) {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.languageSettings.LanguageDisabled",
                            removedLocales.get(0)));
        } else {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.languageSettings.LanguagesDisabled",
                            StringUtils.join(removedLocales, ", ")));
        }
    }

    private boolean disableLocaleSilently(LocaleId localeId) {
        HLocale locale = localeServiceImpl.getByLocaleId(localeId);
        return disableLocaleSilently(locale);
    }

    /**
     * Disable a locale without printing any message.
     *
     * @param locale locale that should be disabled.
     * @return false if the locale was already disabled, true otherwise.
     */
    private boolean disableLocaleSilently(HLocale locale) {
        final Set<HLocale> customizedLocales = getInstance().getCustomizedLocales();
        ensureOverridingLocales();
        boolean localeWasEnabled = customizedLocales.remove(locale);
        getLocaleAliases().remove(locale.getLocaleId());
        refreshDisabledLocales();
        return localeWasEnabled;
    }

    public void enableLocale(HLocale locale) {
        identity.checkPermission(instance, "update");
        enableLocaleSilently(locale);
        LocaleId localeId = locale.getLocaleId();
        facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                msgs.format("jsf.languageSettings.LanguageEnabled", localeId));
    }

    public void enableSelectedLocales() {
        identity.checkPermission(instance, "update");
        List<LocaleId> addedLocales = new ArrayList<>();
        for (Map.Entry<LocaleId, Boolean> entry : selectedDisabledLocales
                .entrySet()) {
            if (entry.getValue()) {
                boolean wasDisabled = enableLocaleSilently(entry.getKey());
                if (wasDisabled) {
                    addedLocales.add(entry.getKey());
                }
            }
        }
        selectedDisabledLocales.clear();

        if (addedLocales.isEmpty()) {
            // This should not be possible in the UI, but maybe if multiple users are editing it.
        } else if (addedLocales.size() == 1) {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.languageSettings.LanguageEnabled",
                            addedLocales.get(0)));
        } else {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.languageSettings.LanguagesEnabled",
                            StringUtils.join(addedLocales, ", ")));
        }
    }

    private boolean enableLocaleSilently(LocaleId localeId) {
        HLocale locale = localeServiceImpl.getByLocaleId(localeId);
        return enableLocaleSilently(locale);
    }

    /**
     * Enable a given locale without printing any message.
     *
     * @param locale locale that should be enabled.
     * @return false if the locale was already enabled, true otherwise.
     */
    private boolean enableLocaleSilently(HLocale locale) {
        ensureOverridingLocales();
        final boolean localeWasDisabled = getInstance().getCustomizedLocales().add(
                locale);
        refreshDisabledLocales();
        return localeWasDisabled;
    }

    public void useDefaultLocales() {
        identity.checkPermission(instance, "update");
        setOverrideLocales(false);
        removeAliasesForDisabledLocales();
        refreshDisabledLocales();
        update();
        facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
            msgs.get("jsf.project.LanguageUpdateFromGlobal"));
    }

    private void removeAliasesForDisabledLocales() {
        Map<LocaleId, String> oldAliases = getLocaleAliases();
        Map<LocaleId, String> newAliases = Maps.newHashMap();
        for (HLocale enabledLocale : getEnabledLocales()) {
            LocaleId key = enabledLocale.getLocaleId();
            if (oldAliases.containsKey(key)) {
                newAliases.put(key, oldAliases.get(key));
            }
        }
        setLocaleAliases(newAliases);
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
     * Copy locale data from project and set overrideLocales, in preparation for
     * making customizations to the locales.
     */
    private void startOverridingLocales() {
        // Copied before setOverrideLocales(true) so that the currently returned
        // values will be used as the basis for any customization.
        List<HLocale> enabledLocales = getEnabledLocales();

        setOverrideLocales(true);

        // Replace contents rather than entire collections to avoid confusion
        // with reference to the collections that are bound before this runs.

        getInstance().getCustomizedLocales().clear();
        getInstance().getCustomizedLocales().addAll(enabledLocales);

        enteredLocaleAliases.clear();

        refreshDisabledLocales();
    }

    /**
     * Update disabled locales to be consistent with enabled locales.
     */
    private void refreshDisabledLocales() {
        // will be re-generated with correct values next time it is fetched.
        disabledLocales = null;
    }

    public void setRestrictedByRole(String key, boolean checked) {
        identity.checkPermission(instance, "update");
        getInstance().setRestrictedByRoles(checked);
        update();
    }

    public void setInviteOnly(boolean inviteOnly) {
        identity.checkPermission(getInstance(), "update");
        log.info("setInviteOnly({})", inviteOnly);
        getInstance().setAllowGlobalTranslation(!inviteOnly);
        update();
    }

    @Override
    protected HProject loadInstance() {
        Session session = (Session) getEntityManager().getDelegate();
        if (projectId == null) {
            HProject project = (HProject) session.byNaturalId(HProject.class)
                .using("slug", getSlug()).load();
            validateProjectState(project);
            projectId = project.getId();
            return project;
        } else {
            HProject project =
                    (HProject) session.byId(HProject.class).load(projectId);
            validateProjectState(project);
            return project;
        }
    }

    private void validateProjectState(HProject project) {
        if (project == null || project.getStatus() == EntityStatus.OBSOLETE) {
            log.warn(
                    "Project [id={}, slug={}], does not exist or is soft deleted: {}",
                    projectId, slug, project);
            throw new EntityNotFoundException();
        }
    }

    public void validateSuppliedId() {
        HProject ip = getInstance(); // this will raise an EntityNotFound
                                     // exception
        // when id is invalid and conversation will not
        // start

        if (ip.getStatus().equals(EntityStatus.OBSOLETE)) {
            throw new EntityNotFoundException();
        }
    }

    @Transactional
    public void updateCopyTrans(String action, String value) {
        copyTransOptionsModel.setInstance(getInstance()
                .getDefaultCopyTransOpts());
        copyTransOptionsModel.update(action, value);
        copyTransOptionsModel.save();
        getInstance().setDefaultCopyTransOpts(
                copyTransOptionsModel.getInstance());

        update();
        facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
            msgs.get("jsf.project.CopyTransOpts.updated"));
    }

    public void initialize() {
        initInstance();
        validateSuppliedId();
        if (getInstance().getDefaultCopyTransOpts() != null) {
            copyTransOptionsModel.setInstance(getInstance()
                    .getDefaultCopyTransOpts());
        }
    }

    public void verifySlugAvailable(ValueChangeEvent e) {
        String slug = (String) e.getNewValue();
        validateSlug(slug, e.getComponent().getId());
    }

    public boolean validateSlug(String slug, String componentId) {
        if (!isSlugAvailable(slug)) {
            facesMessages.addToControl(componentId,
                    "This Project ID is not available");
            return false;
        }
        boolean valid = new SlugValidator().isValid(slug, null);
        if (!valid) {
            String validationMessages =
                    ResourceBundle.getBundle("ValidationMessages").getString(
                            "javax.validation.constraints.Slug.message");
            facesMessages.addToControl(componentId, validationMessages);
            return false;
        }
        return true;
    }

    public boolean isSlugAvailable(String slug) {
        return slugEntityServiceImpl.isSlugAvailable(slug, HProject.class);
    }

    private void updateProjectType() {
        if (!StringUtils.isEmpty(selectedProjectType)
                && !selectedProjectType.equals("null")) {
            ProjectType projectType = ProjectType.valueOf(selectedProjectType);
            getInstance().setDefaultProjectType(projectType);
        } else {
            getInstance().setDefaultProjectType(null);
        }
    }

    public void setSlug(String slug) {
        this.slug = slug;
        this.inputSlugValue = slug;
    }

    @Override
    public String update() {
        identity.checkPermission(instance, "update");
        if (!getInputSlugValue().equals(slug) && !validateSlug(getInputSlugValue(), "slug")) {
            return null;
        }
        getInstance().setSlug(getInputSlugValue());

        boolean softDeleted = false;
        if (getInstance().getStatus() == EntityStatus.OBSOLETE) {
            softDeleted = true;
            getInstance().setSlug(getInstance().changeToDeletedSlug());
        }

        String result = super.update();

        if (softDeleted) {
            String url = urlUtil.dashboardUrl();
            FacesManager.instance().redirectToExternalURL(url);
            return result;
        }
        if (!slug.equals(getInstance().getSlug())) {
            slug = getInstance().getSlug();
            return "projectSlugUpdated";
        }
        return result;
    }

    @Override
    @Transactional
    public String persist() {
        String retValue = "";
        if (!validateSlug(getInputSlugValue(), "slug")) {
            return null;
        }
        getInstance().setSlug(getInputSlugValue());

        if (StringUtils.isEmpty(selectedProjectType)
                || selectedProjectType.equals("null")) {
            facesMessages.addGlobal(SEVERITY_ERROR,
                    "Project type not selected");
            return null;
        }

        if (StringUtils.isEmpty(selectedProjectType)
                || selectedProjectType.equals("null")) {
            facesMessages.addGlobal(SEVERITY_ERROR,
                    "Project type not selected");
            return null;
        }
        updateProjectType();

        if (authenticatedAccount != null) {
            // authenticatedAccount person is a detached entity, so fetch a copy
            // that is attached to the current session.
            HPerson creator = personDAO.findById(
                    authenticatedAccount.getPerson().getId());
            getInstance().addMaintainer(creator);
            getInstance().getCustomizedValidations().clear();
            for (ValidationAction validationAction : validationServiceImpl
                    .getValidationActions("")) {
                getInstance().getCustomizedValidations().put(
                        validationAction.getId().name(),
                        validationAction.getState().name());
            }
            retValue = super.persist();
        }
        return retValue;
    }

    /**
     * Returns the rendered, sanitised HTML for the about page content set by the project maintainer.
     * @return
     */
    public String getAboutHtml() {
        // we could cache this, but it may not be worth it
        String text = getInstance().getHomeContent();
        return renderer.renderToHtmlSafe(text);
    }

    public List<HPerson> getInstanceMaintainers() {
        List<HPerson> list = Lists.newArrayList(getInstance().getMaintainers());
        Collections.sort(list, ComparatorUtil.PERSON_NAME_COMPARATOR);
        return list;
    }

    @In
    private Redirect redirect;

    public String removeMaintainer(HPerson person) {
        identity.checkPermission(instance, "update");
        if (getInstanceMaintainers().size() <= 1) {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                msgs.get("jsf.project.NeedAtLeastOneMaintainer"));
        } else {
            getInstance().removeMaintainer(person);
            maintainerFilter.reset();
            update();

            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                msgs.format("jsf.project.MaintainerRemoved",
                    person.getName()));
            if (person.equals(authenticatedAccount.getPerson())) {
                redirect.setViewId("/project/project.xhtml");
                redirect.setParameter("slug", getSlug());
                redirect.execute();
            }
        }
        return "";
    }

    public void updateRoles(String roleName, boolean isRestricted) {
        identity.checkPermission(instance, "update");
        getInstance().getAllowedRoles().clear();
        if (getInstance().isRestrictedByRoles()) {
            getRoleRestrictions().put(roleName, isRestricted);

            for (Map.Entry<String, Boolean> entry : getRoleRestrictions()
                    .entrySet()) {
                if (entry.getValue()) {
                    getInstance().getAllowedRoles().add(
                            accountRoleDAO.findByName(entry.getKey()));
                }
            }
        }
        update();
        facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
            msgs.get("jsf.RolesUpdated"));
    }

    public void updateStatus(char initial) {
        identity.checkPermission(instance, "update");
        getInstance().setStatus(EntityStatus.valueOf(initial));
        if (getInstance().getStatus() == EntityStatus.READONLY) {
            for (HProjectIteration version : getInstance()
                    .getProjectIterations()) {
                if (version.getStatus() == EntityStatus.ACTIVE) {
                    version.setStatus(EntityStatus.READONLY);
                    entityManager.merge(version);
                }
            }
        } else if (getInstance().getStatus() == EntityStatus.OBSOLETE) {
            for (HProjectIteration version : getInstance()
                    .getProjectIterations()) {
                if (version.getStatus() != EntityStatus.OBSOLETE) {
                    version.setStatus(EntityStatus.OBSOLETE);
                    entityManager.merge(version);
                }
            }
        }
        update();
        facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
            msgs.format("jsf.project.status.updated",
                EntityStatus.valueOf(initial)));
    }

    public void deleteSelf() {
        updateStatus('O');
    }

    public Map<String, Boolean> getRoleRestrictions() {
        if (roleRestrictions == null) {
            roleRestrictions = Maps.newHashMap();

            for (HAccountRole role : getInstance().getAllowedRoles()) {
                roleRestrictions.put(role.getName(), true);
            }
        }
        return roleRestrictions;
    }

    public boolean isRoleRestrictionEnabled(String roleName) {
        if (getRoleRestrictions().containsKey(roleName)) {
            return getRoleRestrictions().get(roleName);
        }
        return false;
    }

    public List<HAccountRole> getAvailableRoles() {
        List<HAccountRole> allRoles = accountRoleDAO.findAll();
        Collections.sort(allRoles, ComparatorUtil.ACCOUNT_ROLE_COMPARATOR);
        return allRoles;
    }

    private List<HProjectIteration> fetchVersions() {
        List<HProjectIteration> results = Lists.newArrayList(Iterables.filter(
                getInstance().getProjectIterations(),
                notObsoleteVersionPredicate));

        Collections.sort(results, new Comparator<HProjectIteration>() {
            @Override
            public int compare(HProjectIteration o1, HProjectIteration o2) {
                EntityStatus fromStatus = o1.getStatus();
                EntityStatus toStatus = o2.getStatus();

                if (fromStatus.equals(toStatus)) {
                    return 0;
                }

                if (fromStatus.equals(EntityStatus.ACTIVE)) {
                    return -1;
                }

                if (fromStatus.equals(EntityStatus.READONLY)) {
                    if (toStatus.equals(EntityStatus.ACTIVE)) {
                        return 1;
                    }
                    return -1;
                }
                return 0;
            }
        });
        return results;
    }

    @Override
    public boolean isIdDefined() {
        return slug != null;
    }

    @Override
    public NaturalIdentifier getNaturalId() {
        return Restrictions.naturalId().set("slug", slug);
    }

    @Override
    public Object getId() {
        return slug;
    }

    private Map<ValidationId, ValidationAction> getValidations() {
        if (availableValidations.isEmpty()) {
            Collection<ValidationAction> validationList =
                    validationServiceImpl.getValidationActions(getInstance().getSlug());

            for (ValidationAction validationAction : validationList) {
                availableValidations.put(validationAction.getId(),
                        validationAction);
            }
        }

        return availableValidations;
    }

    public void updateValidationOption(String name, String state) {
        identity.checkPermission(instance, "update");
        ValidationId validationId = ValidationId.valueOf(name);

        for (Map.Entry<ValidationId, ValidationAction> entry : getValidations()
                .entrySet()) {
            if (entry.getKey().name().equals(name)) {
                getValidations().get(validationId).setState(
                        ValidationAction.State.valueOf(state));
                getInstance().getCustomizedValidations().put(
                        entry.getKey().name(),
                        entry.getValue().getState().name());
                ensureMutualExclusivity(getValidations().get(validationId));
                break;
            }
        }
        update();
        facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
            msgs.format("jsf.validation.updated",
                validationId.getDisplayName(), state));
    }

    public List<ValidationAction> getValidationList() {
        List<ValidationAction> sortedList =
                Lists.newArrayList(getValidations().values());
        Collections.sort(sortedList,
                ValidationFactory.ValidationActionComparator);
        return sortedList;
    }

    public void addWebHook(String url, String secret) {
        identity.checkPermission(instance, "update");
        if (isValidUrl(url)) {
            secret = StringUtils.isBlank(secret) ? null : secret;
            WebHook webHook = new WebHook(this.getInstance(), url, secret);
            getInstance().getWebHooks().add(webHook);
            update();
            facesMessages.addGlobal(
                msgs.format("jsf.project.AddNewWebhook", webHook.getUrl()));
        }
    }

    public void removeWebHook(Long webhookId) {
        identity.checkPermission(instance, "update");
        WebHook webHook = webHookDAO.findById(webhookId);
        if (webHook != null) {
            getInstance().getWebHooks().remove(webHook);
            webHookDAO.makeTransient(webHook);
            facesMessages.addGlobal(
                msgs.format("jsf.project.RemoveWebhook", webHook.getUrl()));
        }
    }

    private boolean isValidUrl(String url) {
        if (!UrlUtil.isValidUrl(url)) {
            facesMessages.addGlobal(SEVERITY_ERROR,
                    msgs.format("jsf.project.InvalidUrl", url));
            return false;
        }
        for(WebHook webHook: getInstance().getWebHooks()) {
            if(StringUtils.equalsIgnoreCase(webHook.getUrl(), url)) {
                facesMessages.addGlobal(SEVERITY_ERROR,
                        msgs.format("jsf.project.DuplicateUrl", url));
                return false;
            }
        }
        return true;
    }

    /**
     * If this action is enabled(Warning or Error), then it's exclusive
     * validation will be turn off
     *
     * @param selectedValidationAction
     */
    private void ensureMutualExclusivity(
            ValidationAction selectedValidationAction) {
        if (selectedValidationAction.getState() != ValidationAction.State.Off) {
            for (ValidationAction exclusiveValAction : selectedValidationAction
                    .getExclusiveValidations()) {
                getInstance().getCustomizedValidations().put(
                        exclusiveValAction.getId().name(),
                        ValidationAction.State.Off.name());
                getValidations().get(exclusiveValAction.getId()).setState(
                        ValidationAction.State.Off);
            }
        }
    }

    public List<ValidationAction.State> getValidationStates() {
        return Arrays.asList(ValidationAction.State.values());
    }

    /**
     * Update the about page to the entered value, and show a success message.
     */
    public void updateAboutPage() {
        identity.checkPermission(instance, "update");
        String status = update();
        if ("updated".equals(status)) {
            facesMessages.addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.get("jsf.project.AboutPageUpdated"));
        } else {
            facesMessages.addGlobal(FacesMessage.SEVERITY_ERROR,
                    msgs.get("jsf.project.AboutPageUpdateFailed"));
        }
    }

    @Override
    protected void updatedMessage() {
        // Disable the default message from Seam
    }

    private boolean checkViewObsolete() {
        return identity != null
                && identity.hasPermission("HProject", "view-obsolete");
    }

    private final Predicate notObsoleteVersionPredicate = new Predicate<HProjectIteration>() {
        @Override
        public boolean apply(HProjectIteration input) {
            return input.getStatus() != EntityStatus.OBSOLETE;
        }
    };

    public String projectRoleDisplayName(ProjectRole role) {
        switch (role) {
            case Maintainer:
                return msgs.get("jsf.Maintainer");
            case TranslationMaintainer:
                return msgs.get("jsf.TranslationMaintainer");
            default:
                return "";
        }
    }

//    /**
//     * The person selected in the "Add someone" dialog.
//     *
//     * @param memberToAdd the person that will be added when the dialog is submitted
//     */
//    public void setMemberToAdd(HPerson memberToAdd) {
//        this.memberToAdd = memberToAdd;
//    }
//
//    public HPerson getMemberToAdd() {
//        return memberToAdd;
//    }

    private class ProjectMaintainersAutocomplete extends MaintainerAutocomplete {

        @Override
        protected List<HPerson> getMaintainers() {
            List<HPerson> list = Lists.newArrayList(getInstance().getMaintainers());
            Collections.sort(list, ComparatorUtil.PERSON_NAME_COMPARATOR);
            return list;
        }

        /**
         * Action when an item is selected
         */
        @Override
        public void onSelectItemAction() {
            if (StringUtils.isEmpty(getSelectedItem())) {
                return;
            }
            ServiceLocator.instance().getInstance(ZanataIdentity.class)
                    .checkPermission(getInstance(), "update");
            HPerson maintainer =
                    ServiceLocator.instance().getInstance(PersonDAO.class)
                            .findByUsername(getSelectedItem());
            getInstance().addMaintainer(maintainer);
            ProjectHome projectHome = ServiceLocator.instance()
                    .getInstance("projectHome", ProjectHome.class);
            projectHome.update();
            reset();

            getFacesMessages().addGlobal(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.project.MaintainerAdded",
                            maintainer.getName()));
        }

        private FacesMessages getFacesMessages() {
            return ServiceLocator.instance().getInstance(FacesMessages.class);
        }
    }

    public List<ProjectType> getProjectTypeList() {
        List<ProjectType> projectTypes = Arrays.asList(ProjectType.values());
        Collections.sort(projectTypes, ComparatorUtil.PROJECT_TYPE_COMPARATOR);
        return projectTypes;
    }
}
