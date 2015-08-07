/*
 * Copyright 2011, Red Hat, Inc. and individual contributors
 * as indicated by the @author tags. See the copyright.txt file in the
 * distribution for a full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package org.zanata.dao;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.common.collect.Lists;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang.StringUtils;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.util.Version;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.FullTextQuery;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.common.LocaleId;
import org.zanata.common.util.GlossaryUtil;
import org.zanata.model.HGlossaryEntry;
import org.zanata.model.HGlossaryTerm;
import org.zanata.model.HLocale;
import org.zanata.rest.dto.GlossaryLocaleStats;
import org.zanata.rest.dto.LocaleDetails;
import org.zanata.rest.service.GlossaryService;
import org.zanata.webtrans.shared.rpc.HasSearchType.SearchType;

/**
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 *
 **/
@Name("glossaryDAO")
@AutoCreate
@Scope(ScopeType.STATELESS)
public class GlossaryDAO extends AbstractDAOImpl<HGlossaryEntry, Long> {
    @In
    private FullTextEntityManager entityManager;

    public GlossaryDAO() {
        super(HGlossaryEntry.class);
    }

    public GlossaryDAO(Session session) {
        super(HGlossaryEntry.class, session);
    }

    public HGlossaryEntry getEntryById(Long id) {
        return (HGlossaryEntry) getSession().load(HGlossaryEntry.class, id);
    }

    public List<HGlossaryEntry> getEntriesByLocale(LocaleId srcLocale,
        LocaleId transLocale, int offset, int maxResults) {
        StringBuilder queryString = new StringBuilder();
        queryString.append("from HGlossaryEntry as e ")
            .append("WHERE e.srcLocale.localeId = :srcLocale and e.id IN ")
                .append("(SELECT t.glossaryEntry.id FROM HGlossaryTerm as t ")
                .append("WHERE t.locale.localeId= :transLocale)");

        Query query = getSession().createQuery(queryString.toString())
            .setParameter("srcLocale", srcLocale)
            .setParameter("transLocale", transLocale)
            .setComment("GlossaryDAO.getEntriesByLocale");

        if (offset > 0 && maxResults > 0) {
            query.setFirstResult(offset).setMaxResults(maxResults);
        }
        return query.list();
    }

    public List<GlossaryLocaleStats> getSourceLocales() {
        String queryString =
            "select e.srcLocale, count(*) from HGlossaryEntry e group by e.srcLocale";
        Query query = getSession()
            .createQuery(queryString)
            .setComment("GlossaryDAO.getSourceLocales");

        @SuppressWarnings("unchecked")
        List<Object[]> list = query.list();
        return getLocaleStats(list);
    }

    public List<GlossaryLocaleStats> getTranslationLocales() {
        String queryString =
                "select t.locale, count(*) from HGlossaryTerm t where t.locale <> t.glossaryEntry.srcLocale group by t.locale";
        Query query = getSession()
                .createQuery(queryString)
                .setComment("GlossaryDAO.getTranslationLocales");

        @SuppressWarnings("unchecked")
        List<Object[]> list = query.list();
        return getLocaleStats(list);
    }

    private List<GlossaryLocaleStats> getLocaleStats(List<Object[]> list) {
        List<GlossaryLocaleStats> localeStats = Lists.newArrayList();

        for (Object[] obj : list) {
            HLocale locale = (HLocale) obj[0];
            Long count = (Long) obj[1];
            int countInt = count == null ? 0 : count.intValue();

            LocaleDetails localeDetails =
                new LocaleDetails(locale.getLocaleId(),
                    locale.retrieveDisplayName(), "");

            localeStats.add(new GlossaryLocaleStats( localeDetails, countInt));
        }
        return localeStats;
    }

    @SuppressWarnings("unchecked")
    public List<HGlossaryEntry> getEntries() {
        Query query = getSession().createQuery("from HGlossaryEntry");
        query.setComment("GlossaryDAO.getEntries");
        return query.list();
    }

    public HGlossaryTerm getTermByEntryAndLocale(Long glossaryEntryId,
            LocaleId locale) {
        Query query =
                getSession()
                        .createQuery(
                                "from HGlossaryTerm as t WHERE t.locale.localeId= :locale AND glossaryEntry.id= :glossaryEntryId");
        query.setParameter("locale", locale);
        query.setParameter("glossaryEntryId", glossaryEntryId);
        query.setComment("GlossaryDAO.getTermByEntryAndLocale");
        return (HGlossaryTerm) query.uniqueResult();
    }

    @SuppressWarnings("unchecked")
    public List<HGlossaryTerm> getTermByGlossaryEntryId(Long glossaryEntryId) {
        Query query =
                getSession()
                        .createQuery(
                                "from HGlossaryTerm as t WHERE t.glossaryEntry.id= :glossaryEntryId");
        query.setParameter("glossaryEntryId", glossaryEntryId);
        query.setComment("GlossaryDAO.getTermByGlossaryEntryId");
        return query.list();
    }

    public HGlossaryEntry getEntryBySourceTermResId(String srcResId,
            LocaleId srcLocaleId) {
        Query query = getSession().createQuery(
                "from HGlossaryEntry as e "
                        + "WHERE e.srcLocale.localeId= :localeId "
                        + "AND e.id IN "
                        + "(SELECT t.glossaryEntry.id FROM HGlossaryTerm as t "
                        + "WHERE t.locale.localeId=e.srcLocale.localeId "
                        + "AND t.resId= :resId)");
        query.setParameter("localeId", srcLocaleId);
        query.setParameter("resId", srcResId);
        query.setComment("GlossaryDAO.getEntryBySourceTermResId");
        return (HGlossaryEntry) query.uniqueResult();
    }

    @SuppressWarnings("unchecked")
    public List<HGlossaryTerm> findByIdList(List<Long> idList) {
        if (idList == null || idList.isEmpty()) {
            return new ArrayList<HGlossaryTerm>();
        }
        Query query =
                getSession().createQuery(
                        "FROM HGlossaryTerm WHERE id in (:idList)");
        query.setParameterList("idList", idList);
        query.setCacheable(false).setComment("GlossaryDAO.getByIdList");
        return query.list();
    }

    public List<Object[]> getSearchResult(String searchText,
            SearchType searchType, LocaleId srcLocale, final int maxResult)
            throws ParseException {
        String queryText;
        switch (searchType) {
        case RAW:
            queryText = searchText;
            break;

        case FUZZY:
            // search by N-grams
            queryText = QueryParser.escape(searchText);
            break;

        case EXACT:
            queryText = "\"" + QueryParser.escape(searchText) + "\"";
            break;

        default:
            throw new RuntimeException("Unknown query type: " + searchType);
        }

        if (StringUtils.isEmpty(queryText)) {
            return new ArrayList<Object[]>();
        }

        QueryParser parser =
                new QueryParser(Version.LUCENE_29, "content",
                        new StandardAnalyzer(Version.LUCENE_29));
        org.apache.lucene.search.Query textQuery = parser.parse(queryText);
        FullTextQuery ftQuery =
                entityManager.createFullTextQuery(textQuery,
                        HGlossaryTerm.class);
        ftQuery.enableFullTextFilter("glossaryLocaleFilter").setParameter(
                "locale", srcLocale);
        ftQuery.setProjection(FullTextQuery.SCORE, FullTextQuery.THIS);
        @SuppressWarnings("unchecked")
        List<Object[]> matches =
                ftQuery.setMaxResults(maxResult).getResultList();
        return matches;
    }

    public Map<HLocale, Integer> getGlossaryTermCountByLocale() {
        Map<HLocale, Integer> result = new HashMap<HLocale, Integer>();

        Query query =
                getSession()
                        .createQuery(
                                "select term.locale, count(*) from HGlossaryTerm term GROUP BY term.locale.localeId");
        query.setComment("GlossaryDAO.getGlossaryTermCountByLocale");

        @SuppressWarnings("unchecked")
        List<Object[]> list = query.list();

        for (Object[] obj : list) {
            HLocale locale = (HLocale) obj[0];
            Long count = (Long) obj[1];
            int countInt = count == null ? 0 : count.intValue();
            result.put(locale, countInt);
        }

        return result;
    }

    public int deleteAllEntries() {
        Query query = getSession().createQuery("Delete HTermComment");
        query.setComment("GlossaryDAO.deleteAllEntries-comments");
        query.executeUpdate();

        Query query2 = getSession().createQuery("Delete HGlossaryTerm");
        query2.setComment("GlossaryDAO.deleteAllEntries-terms");
        int rowCount = query2.executeUpdate();

        Query query3 = getSession().createQuery("Delete HGlossaryEntry");
        query3.setComment("GlossaryDAO.deleteAllEntries-entries");
        query3.executeUpdate();

        return rowCount;
    }

    public int deleteAllEntries(LocaleId targetLocale) {
        Query query =
                getSession()
                        .createQuery(
                                "Delete HTermComment c WHERE c.glossaryTerm.id IN (SELECT t.id FROM HGlossaryTerm t WHERE t.locale.localeId= :locale)");
        query.setParameter("locale", targetLocale);
        query.setComment("GlossaryDAO.deleteLocaleEntries-comments");
        query.executeUpdate();

        Query query2 =
                getSession()
                        .createQuery(
                                "Delete HGlossaryTerm t WHERE t.locale IN (SELECT l FROM HLocale l WHERE localeId= :locale)");
        query2.setParameter("locale", targetLocale);
        query2.setComment("GlossaryDAO.deleteLocaleEntries-terms");
        int rowCount = query2.executeUpdate();

        Query query3 =
                getSession()
                        .createQuery(
                                "Delete HGlossaryEntry e WHERE size(e.glossaryTerms) = 0");
        query3.setComment("GlossaryDAO.deleteLocaleEntries-entries");
        query3.executeUpdate();

        return rowCount;
    }
}
