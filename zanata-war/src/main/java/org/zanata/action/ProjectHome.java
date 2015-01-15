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

import javax.faces.application.FacesMessage;
import javax.faces.event.ValueChangeEvent;
import javax.persistence.EntityManager;
import javax.persistence.EntityNotFoundException;

import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
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
import org.jboss.seam.core.Events;
import org.jboss.seam.faces.FacesMessages;
import org.jboss.seam.international.StatusMessage;
import org.jboss.seam.security.management.JpaIdentityStore;
import org.zanata.common.EntityStatus;
import org.zanata.common.LocaleId;
import org.zanata.common.ProjectType;
import org.zanata.dao.AccountRoleDAO;
import org.zanata.dao.LocaleDAO;
import org.zanata.dao.WebHookDAO;
import org.zanata.i18n.Messages;
import org.zanata.model.HAccount;
import org.zanata.model.HAccountRole;
import org.zanata.model.HLocale;
import org.zanata.model.HPerson;
import org.zanata.model.HProject;
import org.zanata.model.HProjectIteration;
import org.zanata.model.WebHook;
import org.zanata.seam.scope.ConversationScopeMessages;
import org.zanata.security.ZanataIdentity;
import org.zanata.service.LocaleService;
import org.zanata.service.SlugEntityService;
import org.zanata.service.ValidationService;
import org.zanata.service.impl.LocaleServiceImpl;
import org.zanata.ui.AbstractListFilter;
import org.zanata.ui.AbstractTextSearch;
import org.zanata.ui.FilterUtil;
import org.zanata.ui.InMemoryListFilter;
import org.zanata.ui.autocomplete.LocaleAutocomplete;
import org.zanata.ui.autocomplete.MaintainerAutocomplete;
import org.zanata.util.ComparatorUtil;
import org.zanata.util.ServiceLocator;
import org.zanata.util.UrlUtil;
import org.zanata.webtrans.shared.model.ValidationAction;
import org.zanata.webtrans.shared.model.ValidationId;
import org.zanata.webtrans.shared.validation.ValidationFactory;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Name("projectHome")
@Slf4j
public class ProjectHome extends SlugHome<HProject> {
    private static final long serialVersionUID = 1L;

    public static final String PROJECT_UPDATE = "project.update";

    @Getter
    @Setter
    private String slug;

    @In
    private ZanataIdentity identity;

    @In(required = false, value = JpaIdentityStore.AUTHENTICATED_USER)
    private HAccount authenticatedAccount;

    @In
    private LocaleService localeServiceImpl;

    @In
    private LocaleDAO localeDAO;

    @In
    private SlugEntityService slugEntityServiceImpl;

    @In
    private ConversationScopeMessages conversationScopeMessages;

    @In
    private EntityManager entityManager;

    @In
    private Messages msgs;

    @In
    private AccountRoleDAO accountRoleDAO;

    @In
    private WebHookDAO webHookDAO;

    @In
    private ValidationService validationServiceImpl;

    @In
    private CopyTransOptionsModel copyTransOptionsModel;

    /**
     * A separate map is used, rather than binding the alias map from the
     * project directly. This is done so that empty values are not added to the
     * map in every form submission, and so that a value entered in the field
     * for a row is not automatically updated when a different row is submitted.
     */
    @Getter
    @Setter
    private Map<LocaleId, String> inputLocaleAliases = Maps.newHashMap();

    @Getter
    @Setter
    private Map<LocaleId, Boolean> activeLocaleSelections = Maps.newHashMap();

    @Getter
    @Setter
    private Map<LocaleId, Boolean> availableLocaleSelections = Maps
            .newHashMap();

    public Map<LocaleId, Boolean> getActiveLocaleSelections() {
        log.info("getActiveLocaleSelections()");
        if (activeLocaleSelections == null) {
            activeLocaleSelections = Maps.newHashMap();

            // TODO try setting booleans for all the selection checkboxes
            // iterate the active languages, putting Boolean.FALSE for each
            // why don't I need that for setting and printing the aliases?

            // This definitely looks like it is not outputting the values
            // It does not look as though this is even running at all, based on
            // the logs.
            log.info("Was null, creating...", activeLocaleSelections.size());
            for (HLocale locale : getInstanceActiveLocales()) {
                // Trying true just to see if they will start checked.
                activeLocaleSelections.put(locale.getLocaleId(), Boolean.FALSE);
            }
            log.info("selected {} rows", activeLocaleSelections.size());
        }
        return activeLocaleSelections;
    }

    @Getter
    @Setter
    private Boolean selectedCheckbox = Boolean.TRUE;

    @Getter
    private String availableLocaleSearchQuery;

    private List<HLocale> availableLocaleResults;

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
        log.info("createNew()");
        getInstance().setDefaultProjectType(ProjectType.File);
        selectedProjectType = getInstance().getDefaultProjectType().name();
        inputLocaleAliases.putAll(getInstance().getLocaleAliases());
        // force get so it will create and populate the hashmap
        getActiveLocaleSelections();
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

    public void setAvailableLocaleSearchQuery(String query) {
        if(!query.equals(availableLocaleSearchQuery)) {
            // do the search again
            availableLocaleResults = null;
        }
        availableLocaleSearchQuery = query;
    }

    /**
     * Return the list of active locales for this project, which may be
     * inherited from global locales. If the project slug is empty, all the
     * enabled locales for the server are returned.
     */
    public List<HLocale> getInstanceActiveLocales() {
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

    /**
     * Return the locale alias for the given locale in this project, if it
     * exists, otherwise null.
     */
    public String getLocaleAlias(HLocale locale) {
        return getInstance().getLocaleAliases().get(locale.getLocaleId());
    }

    /**
     * Set or remove a locale alias based on form input.
     *
     * Uses value from enteredLocaleAlias. If the value is null or empty, the
     * alias (if any) is removed for the given locale, otherwise the alias is
     * replaced with the value.
     */
    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void updateLocaleAlias(LocaleId localeId) {
        HProject instance = getInstance();
        Map<LocaleId, String> aliases = instance.getLocaleAliases();
        String enteredAlias = inputLocaleAliases.get(localeId);
        if (isNullOrEmpty(enteredAlias)) {
            aliases.remove(localeId);
        } else {
            aliases.put(localeId, enteredAlias);
        }
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void removeLanguage(LocaleId localeId) {
        HLocale locale = localeServiceImpl.getByLocaleId(localeId);

        if (getInstance().isOverrideLocales()) {
            getInstance().getCustomizedLocales().remove(locale);
        } else {
            getInstance().getCustomizedLocales().clear();
            for (HLocale activeLocale : getInstanceActiveLocales()) {
                if (!activeLocale.equals(locale)) {
                    getInstance().getCustomizedLocales().add(activeLocale);
                }
            }
            getInstance().setOverrideLocales(true);
        }
        getInstance().getLocaleAliases().remove(localeId);
        update();
        availableLocaleResults = null;
        conversationScopeMessages.setMessage(
                FacesMessage.SEVERITY_INFO,
                msgs.format("jsf.project.LanguageRemoved",
                        locale.retrieveDisplayName()));
    }

    private void removeAlias(LocaleId localeId) {
        HLocale locale = localeServiceImpl.getByLocaleId(localeId);

        if (getInstance().isOverrideLocales()) {
            getInstance().getLocaleAliases().remove(localeId);
        } else {
            // If the project instance is not overriding locales, there
            // are no aliases
        }
        update();
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void removeSelectedLanguages() {
        log.info("removeSelectedLanguages()");
        log.info("selected {} rows", getActiveLocaleSelections().size());
        for (Map.Entry<LocaleId, Boolean> entry : getActiveLocaleSelections().entrySet()) {
            log.info("mapping with {} {}", entry.getKey(), entry.getValue());
            if (entry.getValue()) {
                removeLanguage(entry.getKey());
            }
        }
        activeLocaleSelections.clear();
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void removeSelectedAliases() {
        log.info("removeSelectedAliases()");
        log.info("selected {} rows", getActiveLocaleSelections().size());
        for (Map.Entry<LocaleId, Boolean> entry : getActiveLocaleSelections().entrySet()) {
            log.info("mapping with {} {}", entry.getKey(), entry.getValue());
            if (entry.getValue()) {
                removeAlias(entry.getKey());
            }
        }
        activeLocaleSelections.clear();
        conversationScopeMessages.setMessage(
                FacesMessage.SEVERITY_INFO,
                msgs.get("jsf.project.LanguageAliasesRemoved"));
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void addLanguage(LocaleId localeId) {
        HLocale locale =
                localeServiceImpl.getByLocaleId(localeId);

        if (!getInstance().isOverrideLocales()) {
            getInstance().setOverrideLocales(true);
            getInstance().getCustomizedLocales().clear();
            getInstance().getCustomizedLocales().addAll(
                    localeServiceImpl
                            .getSupportedLocales());
        }
        availableLocaleResults = null;
        getInstance().getCustomizedLocales().add(locale);
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void addSelectedAvailableLanguages() {
        for (Map.Entry<LocaleId, Boolean> entry : availableLocaleSelections
                .entrySet()) {
            if (entry.getValue()) {
                addLanguage(entry.getKey());
            }
        }
        availableLocaleSelections.clear();
        conversationScopeMessages.setMessage(
                FacesMessage.SEVERITY_INFO,
                msgs.get("jsf.project.LanguageAliasesRemoved"));
    }


    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void updateLanguagesFromGlobal() {
        getInstance().setOverrideLocales(false);
        removeAliasesForInactiveLocales();
        update();
        conversationScopeMessages.setMessage(FacesMessage.SEVERITY_INFO,
                msgs.get("jsf.project.LanguageUpdateFromGlobal"));
    }

    private void removeAliasesForInactiveLocales() {
        Map<LocaleId, String> oldAliases = getInstance().getLocaleAliases();
        Map<LocaleId, String> newAliases = Maps.newHashMap();
        for (HLocale activeLocale : getInstanceActiveLocales()) {
            LocaleId key = activeLocale.getLocaleId();
            if (oldAliases.containsKey(key)) {
                newAliases.put(key, oldAliases.get(key));
            }
        }
        getInstance().setLocaleAliases(newAliases);
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void setRestrictedByRole(String key, boolean checked) {
        getInstance().setRestrictedByRoles(checked);
        update();
    }

    @Override
    protected HProject loadInstance() {
        Session session = (Session) getEntityManager().getDelegate();
        return (HProject) session.byNaturalId(HProject.class)
                .using("slug", getSlug()).load();
    }

    public void validateSuppliedId() {
        HProject ip = getInstance(); // this will raise an EntityNotFound
                                     // exception
        // when id is invalid and conversation will not
        // start

        if (ip.getStatus().equals(EntityStatus.OBSOLETE)
                && !checkViewObsolete()) {
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

        conversationScopeMessages.setMessage(FacesMessage.SEVERITY_INFO,
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
            FacesMessages.instance().addToControl(componentId,
                    "This Project ID is not available");
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

    @Override
    @Transactional
    public String persist() {
        String retValue = "";
        if (!validateSlug(getInstance().getSlug(), "slug")) {
            return null;
        }

        if (StringUtils.isEmpty(selectedProjectType)
                || selectedProjectType.equals("null")) {
            FacesMessages.instance().add(StatusMessage.Severity.ERROR,
                    "Project type not selected");
            return null;
        }

        if (StringUtils.isEmpty(selectedProjectType)
                || selectedProjectType.equals("null")) {
            FacesMessages.instance().add(StatusMessage.Severity.ERROR,
                    "Project type not selected");
            return null;
        }
        updateProjectType();

        if (authenticatedAccount != null) {
            getInstance().addMaintainer(authenticatedAccount.getPerson());
            getInstance().getCustomizedValidations().clear();
            for (ValidationAction validationAction : validationServiceImpl
                    .getValidationActions("")) {
                getInstance().getCustomizedValidations().put(
                        validationAction.getId().name(),
                        validationAction.getState().name());
            }
            retValue = super.persist();
            Events.instance().raiseEvent("projectAdded");
        }
        return retValue;
    }

    public List<HPerson> getInstanceMaintainers() {
        List<HPerson> list = Lists.newArrayList(getInstance().getMaintainers());
        Collections.sort(list, ComparatorUtil.PERSON_NAME_COMPARATOR);
        return list;
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public String removeMaintainer(HPerson person) {
        if (getInstanceMaintainers().size() <= 1) {
            conversationScopeMessages
                    .setMessage(FacesMessage.SEVERITY_INFO,
                            msgs.get("jsf.project.NeedAtLeastOneMaintainer"));
        } else {
            getInstance().getMaintainers().remove(person);
            maintainerFilter.reset();
            update();

            conversationScopeMessages.setMessage(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.project.MaintainerRemoved",
                            person.getName()));

            // force page to do url redirect to project page. See pages.xml
            if (person.equals(authenticatedAccount.getPerson())) {
                return "redirect";
            }
        }
        return "";
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void updateRoles(String roleName, boolean isRestricted) {
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
        conversationScopeMessages.setMessage(FacesMessage.SEVERITY_INFO,
                msgs.get("jsf.RolesUpdated"));
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void updateStatus(char initial) {
        getInstance().setStatus(EntityStatus.valueOf(initial));
        if (getInstance().getStatus() == EntityStatus.READONLY) {
            for (HProjectIteration version : getInstance()
                    .getProjectIterations()) {
                if (version.getStatus() == EntityStatus.ACTIVE) {
                    version.setStatus(EntityStatus.READONLY);
                    entityManager.merge(version);
                    Events.instance().raiseEvent(
                            VersionHome.PROJECT_ITERATION_UPDATE, version);
                }
            }
        } else if (getInstance().getStatus() == EntityStatus.OBSOLETE) {
            for (HProjectIteration version : getInstance()
                    .getProjectIterations()) {
                if (version.getStatus() != EntityStatus.OBSOLETE) {
                    version.setStatus(EntityStatus.OBSOLETE);
                    entityManager.merge(version);
                    Events.instance().raiseEvent(
                            VersionHome.PROJECT_ITERATION_UPDATE, version);
                }
            }
        }
        update();

        conversationScopeMessages.setMessage(FacesMessage.SEVERITY_INFO,
                msgs.format("jsf.project.status.updated",
                        EntityStatus.valueOf(initial)));
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
        List<HProjectIteration> results = new ArrayList<HProjectIteration>();

        for (HProjectIteration iteration : getInstance().getProjectIterations()) {
            if (iteration.getStatus() == EntityStatus.OBSOLETE
                    && checkViewObsolete()) {
                results.add(iteration);
            } else if (iteration.getStatus() != EntityStatus.OBSOLETE) {
                results.add(iteration);
            }
        }
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

                if (fromStatus.equals(EntityStatus.OBSOLETE)) {
                    return 1;
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
                    validationServiceImpl.getValidationActions(slug);

            for (ValidationAction validationAction : validationList) {
                availableValidations.put(validationAction.getId(),
                        validationAction);
            }
        }

        return availableValidations;
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void updateValidationOption(String name, String state) {
        ValidationId validatationId = ValidationId.valueOf(name);

        for (Map.Entry<ValidationId, ValidationAction> entry : getValidations()
                .entrySet()) {
            if (entry.getKey().name().equals(name)) {
                getValidations().get(validatationId).setState(
                        ValidationAction.State.valueOf(state));
                getInstance().getCustomizedValidations().put(
                        entry.getKey().name(),
                        entry.getValue().getState().name());
                ensureMutualExclusivity(getValidations().get(validatationId));
                break;
            }
        }
        update();

        conversationScopeMessages.setMessage(FacesMessage.SEVERITY_INFO,
                msgs.format("jsf.validation.updated",
                        validatationId.getDisplayName(), state));
    }

    public List<ValidationAction> getValidationList() {
        List<ValidationAction> sortedList =
                Lists.newArrayList(getValidations().values());
        Collections.sort(sortedList,
                ValidationFactory.ValidationActionComparator);
        return sortedList;
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void addWebHook(String url) {
        if (isValidUrl(url)) {
            WebHook webHook = new WebHook(this.getInstance(), url);
            getInstance().getWebHooks().add(webHook);
            update();
            FacesMessages.instance().add(StatusMessage.Severity.INFO,
                msgs.format("jsf.project.AddNewWebhook", webHook.getUrl()));
        }
    }

    @Restrict("#{s:hasPermission(projectHome.instance, 'update')}")
    public void removeWebHook(WebHook webHook) {
        getInstance().getWebHooks().remove(webHook);
        webHookDAO.makeTransient(webHook);
        FacesMessages.instance().add(StatusMessage.Severity.INFO,
            msgs.format("jsf.project.RemoveWebhook", webHook.getUrl()));
    }

    private boolean isValidUrl(String url) {
        if (!UrlUtil.isValidUrl(url)) {
            FacesMessages.instance().add(StatusMessage.Severity.ERROR,
                    msgs.format("jsf.project.InvalidUrl", url));
            return false;
        }
        for(WebHook webHook: getInstance().getWebHooks()) {
            if(StringUtils.equalsIgnoreCase(webHook.getUrl(), url)) {
                FacesMessages.instance().add(StatusMessage.Severity.ERROR,
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
     * @return The list of available locales after filtering out the ones
     *         already in the project and based on the available locale search
     *         filter.
     */
    public void searchAvailableLocales() {
        Collection<HLocale> filtered =
                Collections2.filter(localeDAO.findAllActive(),
                        new Predicate<HLocale>() {
                            @Override
                            public boolean apply(HLocale input) {
                                String query =
                                        availableLocaleSearchQuery == null ? ""
                                                : availableLocaleSearchQuery;
                                // only include those not already in
                                // the project and
                                // that match the search query
                                return (input
                                        .asULocale()
                                        .getDisplayName()
                                        .toLowerCase()
                                        .contains(
                                                query.toLowerCase()) ||
                                        input.getLocaleId()
                                                .getId()
                                                .toLowerCase()
                                                .contains(
                                                        query.toLowerCase()))
                                        && !getInstanceActiveLocales()
                                        .contains(input);
                            }
                        });
        availableLocaleResults = Lists.newArrayList(filtered);
    }

    public List<HLocale> getAvailableLocaleResults() {
        if(availableLocaleResults == null) {
            searchAvailableLocales();
        }
        return availableLocaleResults;
    }


    /**
     * This is for autocomplete components of which ConversationScopeMessages
     * will be null
     *
     * @param conversationScopeMessages
     */
    private String update(ConversationScopeMessages conversationScopeMessages) {
        if (this.conversationScopeMessages == null) {
            this.conversationScopeMessages = conversationScopeMessages;
        }
        return update();
    }

    private boolean checkViewObsolete() {
        return identity != null
                && identity.hasPermission("HProject", "view-obsolete");
    }

    private class ProjectMaintainersAutocomplete extends MaintainerAutocomplete {

        @Override
        protected List<HPerson> getMaintainers() {
            return getInstanceMaintainers();
        }

        /**
         * Action when an item is selected
         */
        @Override
        public void onSelectItemAction() {
            if (StringUtils.isEmpty(getSelectedItem())) {
                return;
        }


            HPerson maintainer = personDAO.findByUsername(getSelectedItem());
            getInstance().addMaintainer(maintainer);
            update(conversationScopeMessages);
            reset();

            conversationScopeMessages.setMessage(FacesMessage.SEVERITY_INFO,
                    msgs.format("jsf.project.MaintainerAdded",
                            maintainer.getName()));
        }
    }

    public List<ProjectType> getProjectTypeList() {
        List<ProjectType> projectTypes = Arrays.asList(ProjectType.values());
        Collections.sort(projectTypes, ComparatorUtil.PROJECT_TYPE_COMPARATOR);
        return projectTypes;
    }
}
