package org.zanata.rest.service;

import java.util.List;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.UriInfo;

import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.common.LocaleId;
import org.zanata.dao.GlossaryDAO;
import org.zanata.model.HGlossaryEntry;
import org.zanata.model.HGlossaryTerm;
import org.zanata.model.HTermComment;
import org.zanata.rest.dto.Glossary;
import org.zanata.rest.dto.GlossaryEntry;
import org.zanata.rest.dto.GlossaryLocaleStats;
import org.zanata.rest.dto.GlossaryLocales;
import org.zanata.rest.dto.GlossaryTerm;
import org.zanata.security.ZanataIdentity;
import org.zanata.service.GlossaryFileService;

@Name("glossaryService")
@Path(GlossaryResource.SERVICE_PATH)
@Slf4j
@Transactional
public class GlossaryService implements GlossaryResource {
    @Context
    private UriInfo uri;

    @HeaderParam("Content-Type")
    @Context
    private MediaType requestContentType;

    @Context
    private HttpHeaders headers;

    @Context
    private Request request;

    @In
    private GlossaryDAO glossaryDAO;

    @In
    private GlossaryFileService glossaryFileServiceImpl;

    @In
    private ZanataIdentity identity;


    @Override
    public Response getLocaleStatistic() {
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        List<GlossaryLocaleStats> srcLocales = glossaryDAO.getSourceLocales();
        List<GlossaryLocaleStats> transLocales =
            glossaryDAO.getTranslationLocales();

        GlossaryLocales glossaryLocales =
            new GlossaryLocales(srcLocales, transLocales);

        return Response.ok(glossaryLocales).build();
    }

    @Override
    public Response getEntries() {
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        List<HGlossaryEntry> hGlosssaryEntries = glossaryDAO.getEntries();

        Glossary glossary = new Glossary();
        transferEntriesResource(hGlosssaryEntries, glossary);

        return Response.ok(glossary).build();
    }

    @Override
    public Response get(@PathParam("srcLocale") LocaleId srcLocale,
        @PathParam("transLocale") LocaleId transLocale,
        @DefaultValue("-1") @QueryParam("page") int page,
        @DefaultValue("-1") @QueryParam("sizePerPage") int sizePerPage) {

        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        int offset = (page - 1) * sizePerPage;
        List<HGlossaryEntry> hGlosssaryEntries =
            glossaryDAO.getEntriesByLocale(srcLocale, transLocale, offset,
                sizePerPage);

        Glossary glossary = new Glossary();

        transferEntriesLocaleResource(hGlosssaryEntries, glossary, transLocale);

        return Response.ok(glossary).build();
    }

    @Override
    public Response put(Glossary glossary) {
        identity.checkPermission("", "glossary-insert");
        ResponseBuilder response;

        // must be a create operation
        response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }
        response = Response.created(uri.getAbsolutePath());

        glossaryFileServiceImpl.saveOrUpdateGlossary(glossary);

        return response.build();
    }

    @Override
    public Response deleteGlossary(LocaleId targetLocale) {
        identity.checkPermission("", "glossary-delete");
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        int rowCount = glossaryDAO.deleteAllEntries(targetLocale);
        log.info("Glossary delete (" + targetLocale + "): " + rowCount);

        return Response.ok().build();
    }

    @Override
    public Response deleteGlossary(LocaleId localeId, String resId) {
        identity.checkPermission("", "glossary-delete");

        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        HGlossaryEntry entry =
                glossaryDAO.getEntryBySourceTermResId(resId, localeId);

        if(entry != null) {
            glossaryDAO.makeTransient(entry);
        }
        return Response.ok().build();
    }

    @Override
    public Response deleteGlossaries() {
        identity.checkPermission("", "glossary-delete");
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }
        int rowCount = glossaryDAO.deleteAllEntries();
        log.info("Glossary delete all: " + rowCount);

        return Response.ok().build();
    }

    public void transferEntriesResource(List<HGlossaryEntry> hGlossaryEntries,
            Glossary glossary) {
        for (HGlossaryEntry hGlossaryEntry : hGlossaryEntries) {
            GlossaryEntry glossaryEntry = generateGlossaryEntry(hGlossaryEntry);

            for (HGlossaryTerm term : hGlossaryEntry.getGlossaryTerms()
                    .values()) {
                GlossaryTerm glossaryTerm = generateGlossaryTerm(term);
                glossaryEntry.getGlossaryTerms().add(glossaryTerm);
            }
            glossary.getGlossaryEntries().add(glossaryEntry);
        }
    }

    public static void transferEntriesLocaleResource(
            List<HGlossaryEntry> hGlossaryEntries, Glossary glossary,
            LocaleId locale) {
        for (HGlossaryEntry hGlossaryEntry : hGlossaryEntries) {
            GlossaryEntry glossaryEntry = generateGlossaryEntry(hGlossaryEntry);
            LocaleId srcLocale = hGlossaryEntry.getSrcLocale().getLocaleId();

            for (HGlossaryTerm hGlossaryTerm : hGlossaryEntry
                    .getGlossaryTerms().values()) {
                LocaleId termLocale = hGlossaryTerm.getLocale().getLocaleId();
                if (termLocale.equals(locale) || termLocale.equals(srcLocale)) {
                    GlossaryTerm glossaryTerm =
                            generateGlossaryTerm(hGlossaryTerm);

                    glossaryEntry.getGlossaryTerms().add(glossaryTerm);
                }
            }
            glossary.getGlossaryEntries().add(glossaryEntry);
        }
    }

    public static GlossaryEntry generateGlossaryEntry(
            HGlossaryEntry hGlossaryEntry) {
        GlossaryEntry glossaryEntry = new GlossaryEntry();
        glossaryEntry.setSrcLang(hGlossaryEntry.getSrcLocale().getLocaleId());
        glossaryEntry.setSourceReference(hGlossaryEntry.getSourceRef());
        return glossaryEntry;
    }

    public static GlossaryTerm generateGlossaryTerm(HGlossaryTerm hGlossaryTerm) {
        GlossaryTerm glossaryTerm = new GlossaryTerm(hGlossaryTerm.getResId());
        glossaryTerm.setContent(hGlossaryTerm.getContent());
        glossaryTerm.setLocale(hGlossaryTerm.getLocale().getLocaleId());

        String name = "";
        if(hGlossaryTerm.getLastModifiedBy() != null) {
            name = hGlossaryTerm.getLastModifiedBy().getName();
        }
        glossaryTerm.setLastModifiedBy(name);
        glossaryTerm.setLastModifiedDate(hGlossaryTerm.getLastChanged());


        for (HTermComment hTermComment : hGlossaryTerm.getComments()) {
            glossaryTerm.getComments().add(hTermComment.getComment());
        }
        return glossaryTerm;
    }
}
