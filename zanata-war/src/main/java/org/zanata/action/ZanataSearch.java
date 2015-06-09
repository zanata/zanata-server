package org.zanata.action;

import java.io.Serializable;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

import javax.faces.model.DataModel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import org.apache.commons.lang.StringUtils;
import org.apache.lucene.queryParser.ParseException;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.dao.AccountDAO;
import org.zanata.dao.ProjectDAO;
import org.zanata.model.HAccount;
import org.zanata.model.HLocale;
import org.zanata.model.HProject;

import com.google.common.collect.Lists;
import org.zanata.ui.AbstractAutocomplete;
import org.zanata.ui.AbstractListFilter;
import org.zanata.ui.InMemoryListFilter;
import org.zanata.util.DateUtil;
import org.zanata.util.ServiceLocator;

/**
 * This will search both projects and people.
 */
@Name("zanataSearch")
@Scope(ScopeType.CONVERSATION)
@AutoCreate
public class ZanataSearch implements Serializable {

    private static final long serialVersionUID = 1L;

    private final static int DEFAULT_PAGE_SIZE = 30;

    private final boolean includeObsolete = false;
    
    @In
    private ProjectDAO projectDAO;

    @Getter
    private ProjectUserAutocomplete autocomplete = new ProjectUserAutocomplete();

    @Getter
    private SortingType ProjectSortingList = new SortingType(
        Lists.newArrayList(SortingType.SortOption.ALPHABETICAL,
            SortingType.SortOption.CREATED_DATE));

    private QueryProjectPagedListDataModel queryProjectPagedListDataModel =
            new QueryProjectPagedListDataModel(DEFAULT_PAGE_SIZE);

    // Count of project to be return as part of autocomplete
    private final static int INITIAL_RESULT_COUNT = 10;

    // Count of person to be return as part of autocomplete
    private final static int INITIAL_PERSON_RESULT_COUNT = 20;

    private final ProjectComparator projectComparator =
        new ProjectComparator(getProjectSortingList());

    public DataModel getProjectPagedListDataModel() {
        return queryProjectPagedListDataModel;
    }

    @AllArgsConstructor
    @NoArgsConstructor
    public class SearchResult {
        @Getter
        private HProject project;

        @Getter
        private HAccount account;

        public boolean isProjectNull() {
            return project == null;
        }
        public boolean isUserNull() {
            return account == null;
        }
    }

    private class ProjectUserAutocomplete extends
            AbstractAutocomplete<SearchResult> {

        private ProjectDAO projectDAO =
                ServiceLocator.instance().getInstance(ProjectDAO.class);

        private AccountDAO accountDAO = ServiceLocator.instance().getInstance(
                AccountDAO.class);

        /**
         * Return results on search
         */
        @Override
        public List<SearchResult> suggest() {
            List<SearchResult> result = Lists.newArrayList();
            if (StringUtils.isEmpty(getQuery())) {
                return result;
            }
            try {
                String searchQuery = getQuery().trim();
                List<HProject> searchResult =
                        projectDAO.searchProjects(searchQuery,
                                INITIAL_RESULT_COUNT, 0, includeObsolete);

                for (HProject project : searchResult) {
                    result.add(new SearchResult(project, null));
                }
                List<HAccount> hAccounts =
                        accountDAO.searchQuery(searchQuery,
                                INITIAL_PERSON_RESULT_COUNT, 0);
                for (HAccount hAccount : hAccounts) {
                    result.add(new SearchResult(null, hAccount));
                }
                result.add(new SearchResult());
                return result;
            } catch (ParseException pe) {
                return result;
            }

        }

        /**
         * Action when an item is selected
         */
        @Override
        public void onSelectItemAction() {
            // nothing here
        }

        @Override
        public void setQuery(String query) {
            queryProjectPagedListDataModel.setQuery(query);
            super.setQuery(query);
        }
    }

    @Getter
    private final AbstractListFilter<HProject> projectTabProjectFilter =
        new AbstractListFilter<HProject>() {
            
            private ProjectDAO projectDAO = ServiceLocator.instance()
                .getInstance(ProjectDAO.class);

            @Override
            protected List<HProject> fetchRecords(int start, int max,
                String filter) {
                try {
                    String search = filter;
                    if (StringUtils.isEmpty(search)) {
                        search = getAutocomplete().getQuery();
                        if(StringUtils.isEmpty(search)) {
                            return Collections.emptyList();
                        }
                    }
                    List<HProject> projects = projectDAO.searchProjects(search, -1, 0,
                        includeObsolete);
                    Collections.sort(projects, projectComparator);
                    return projects;
                } catch (ParseException ex) {
                    return Collections.emptyList();
                }
            }

            @Override
            protected long fetchTotalRecords(String filter) {
                try {
                    String search = filter;
                    if (StringUtils.isEmpty(search)) {
                        search = getAutocomplete().getQuery();
                        if(StringUtils.isEmpty(search)) {
                            return 0L;
                        }
                    }
                    return projectDAO.getQueryProjectSize(search,
                        includeObsolete);
                } catch (ParseException ex) {
                    return 0L;
                }
            }
        };
    
    public int getTotalProjectCount() {
        try {
            return projectDAO.getQueryProjectSize(getAutocomplete().getQuery(),
                    includeObsolete);
        } catch (ParseException pe) {
            return 0;
        }
    }

    public int getTotalUserCount() {
        return 0;
    }

    public String getHowLongAgoDescription(Date date) {
        return DateUtil.getHowLongAgoDescription(date);
    }

    /**
     * Sort project list
     */
    public void sortProjectList() {
        projectTabProjectFilter.reset();
    }

    private class ProjectComparator implements Comparator<HProject> {
        private SortingType sortingType;

        public ProjectComparator(SortingType sortingType) {
            this.sortingType = sortingType;
        }

        @Override
        public int compare(HProject o1, HProject o2) {
            SortingType.SortOption selectedSortOption =
                sortingType.getSelectedSortOption();

            if (!selectedSortOption.isAscending()) {
                HProject temp = o1;
                o1 = o2;
                o2 = temp;
            }

            if (selectedSortOption.equals(SortingType.SortOption.CREATED_DATE)) {
                return o1.getCreationDate().compareTo(o2.getCreationDate());
            } else {
                return o1.getName().toLowerCase().compareTo(
                    o2.getName().toLowerCase());
            }
        }
    }
}
