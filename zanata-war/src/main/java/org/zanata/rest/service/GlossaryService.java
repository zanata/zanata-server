package org.zanata.rest.service;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.UriInfo;

import com.google.common.base.Optional;
import com.google.common.collect.Lists;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import org.jboss.resteasy.util.GenericType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.common.LocaleId;
import org.zanata.dao.GlossaryDAO;
import org.zanata.model.HGlossaryEntry;
import org.zanata.model.HGlossaryTerm;
import org.zanata.model.HLocale;
import org.zanata.model.HTermComment;
import org.zanata.rest.dto.Glossary;
import org.zanata.rest.dto.GlossaryEntry;
import org.zanata.rest.dto.GlossaryLocaleStats;
import org.zanata.rest.dto.GlossaryTerm;
import org.zanata.rest.dto.LocaleDetails;
import org.zanata.rest.editor.dto.Locale;
import org.zanata.security.ZanataIdentity;
import org.zanata.service.GlossaryFileService;

import com.google.common.base.Function;

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
    public Response getLocales() {
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        List<GlossaryLocaleStats> localeDetails = glossaryDAO.getLocalesStats();
        Type genericType = new GenericType<List<GlossaryLocaleStats>>() {
        }.getGenericType();
        Object entity =
            new GenericEntity<List<GlossaryLocaleStats>>(localeDetails, genericType);
        return Response.ok(entity).build();
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
    public Response get(@PathParam("locale") LocaleId locale,
        @DefaultValue("-1") @QueryParam("page") int page,
        @DefaultValue("-1") @QueryParam("sizePerPage") int sizePerPage) {

        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        int offset = (page - 1) * sizePerPage;
        List<HGlossaryEntry> hGlosssaryEntries =
            glossaryDAO.getEntriesByLocaleId(locale, offset, sizePerPage);
        Glossary glossary = new Glossary();

        transferEntriesLocaleResource(hGlosssaryEntries, glossary, locale);

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

        glossaryFileServiceImpl.saveGlossary(glossary);

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

            for (HGlossaryTerm hGlossaryTerm : hGlossaryEntry
                    .getGlossaryTerms().values()) {
                if (hGlossaryTerm.getLocale().getLocaleId().equals(locale)) {
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

        for (HTermComment hTermComment : hGlossaryTerm.getComments()) {
            glossaryTerm.getComments().add(hTermComment.getComment());
        }
        return glossaryTerm;
    }
}
