package org.zanata.rest.service;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang.StringUtils;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;
import org.jboss.resteasy.util.GenericType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.common.GlossarySortField;
import org.zanata.common.LocaleId;
import org.zanata.dao.GlossaryDAO;
import org.zanata.exception.ZanataServiceException;
import org.zanata.model.HGlossaryEntry;
import org.zanata.model.HGlossaryTerm;
import org.zanata.model.HLocale;
import org.zanata.rest.GlossaryFileUploadForm;
import org.zanata.rest.dto.Glossary;
import org.zanata.rest.dto.GlossaryEntry;
import org.zanata.rest.dto.GlossaryInfo;
import org.zanata.rest.dto.GlossaryLocaleInfo;
import org.zanata.rest.dto.GlossaryTerm;
import org.zanata.rest.dto.LocaleDetails;
import org.zanata.security.ZanataIdentity;
import org.zanata.service.GlossaryFileService;
import org.zanata.service.LocaleService;

@Name("glossaryService")
@Path(GlossaryResource.SERVICE_PATH)
@Slf4j
@Transactional
public class GlossaryService implements GlossaryResource {
    @Context
    private Request request;

    @In
    private GlossaryDAO glossaryDAO;

    @In
    private GlossaryFileService glossaryFileServiceImpl;

    @In
    private ZanataIdentity identity;

    @In
    private LocaleService localeServiceImpl;

    @Override
    public Response getInfo() {
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        HLocale srcLocale = localeServiceImpl.getByLocaleId(LocaleId.EN_US);
        int entryCount =
                glossaryDAO.getEntryCountBySourceLocales(LocaleId.EN_US);

        GlossaryLocaleInfo srcGlossaryLocale =
                new GlossaryLocaleInfo(generateLocaleDetails(srcLocale), entryCount);

        Map<LocaleId, Integer> transMap = glossaryDAO.getTranslationLocales();

        List<HLocale> supportedLocales =
            localeServiceImpl.getSupportedLocales();

        List<GlossaryLocaleInfo> transLocale = Lists.newArrayList();

        for(HLocale locale: supportedLocales) {
            LocaleDetails localeDetails = generateLocaleDetails(locale);
            int count = transMap.containsKey(locale.getLocaleId()) ?
                transMap.get(locale.getLocaleId()) : 0;

            transLocale.add(new GlossaryLocaleInfo(localeDetails, count));
        }

        GlossaryInfo glossaryInfo =
            new GlossaryInfo(srcGlossaryLocale, transLocale);

        return Response.ok(glossaryInfo).build();
    }

    private LocaleDetails generateLocaleDetails(HLocale locale) {
        return new LocaleDetails(locale.getLocaleId(),
            locale.retrieveDisplayName(), "");
    }

    @Override
    @Deprecated
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

    private List<GlossarySortField> convertToSortField(
        String commaSeparatedFields) {
        List<GlossarySortField> result = Lists.newArrayList();

        String[] fields = StringUtils.split(commaSeparatedFields, ",");
        if(fields == null || fields.length <= 0) {
            //default sorting
            result.add(GlossarySortField
                    .getByField(GlossarySortField.SRC_CONTENT));
            return result;
        }

        for (String field : fields) {
            GlossarySortField sortField = GlossarySortField.getByField(field);
            if(sortField != null) {
                result.add(sortField);
            }
        }
        return result;
    }

    @Override
    public Response getEntriesForLocale(@PathParam("srcLocale") LocaleId srcLocale,
        @PathParam("transLocale") LocaleId transLocale,
        @DefaultValue("1") @QueryParam("page") int page,
        @DefaultValue("5000") @QueryParam("sizePerPage") int sizePerPage,
        @QueryParam("filter") String filter,
        @QueryParam("sort") String fields) {

        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        int offset = (page - 1) * sizePerPage;
        List<HGlossaryEntry> hGlosssaryEntries =
            glossaryDAO.getEntriesByLocale(srcLocale, offset, sizePerPage,
                filter, convertToSortField(fields));
        int totalCount =
            glossaryDAO.getEntriesCount(srcLocale, filter);

        Glossary glossary = new Glossary();
        glossary.setTotalCount(totalCount);

        transferEntriesLocaleResource(hGlosssaryEntries, glossary, transLocale);

        return Response.ok(glossary).build();
    }

    @Override
    public Response getAllEntries(LocaleId srcLocaleId,
        @DefaultValue("1") @QueryParam("page") int page,
        @DefaultValue("5000") @QueryParam("sizePerPage") int sizePerPage,
        @QueryParam("filter") String filter,
        @QueryParam("sort") String fields) {
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }
        int offset = (page - 1) * sizePerPage;

        List<HGlossaryEntry> hGlosssaryEntries =
                glossaryDAO.getEntriesByLocale(srcLocaleId, offset,
                    sizePerPage, filter, convertToSortField(fields));
        int totalCount =
            glossaryDAO.getEntriesCount(srcLocaleId, filter);
        Glossary glossary = new Glossary();
        glossary.setTotalCount(totalCount);

        //filter out all terms other than source term
        transferEntriesLocaleResource(hGlosssaryEntries, glossary, srcLocaleId);

        return Response.ok(glossary).build();
    }

    @Override
    public Response put(Glossary glossary) {
        return insertOrUpdate(glossary);
    }

    @Override
    public Response post(Glossary glossary) {
        return insertOrUpdate(glossary);
    }

    private Response insertOrUpdate(Glossary glossary) {
        identity.checkPermission("", "glossary-insert");
        // must be a create operation
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }
        List<HGlossaryEntry> entry =
            glossaryFileServiceImpl.saveOrUpdateGlossary(glossary);
        Glossary savedGlossary = new Glossary();
        transferEntriesResource(entry, savedGlossary);

        return Response.ok(savedGlossary).build();
    }

    @Override
    public Response upload(@MultipartForm GlossaryFileUploadForm form) {
        identity.checkPermission("", "glossary-insert");

        final Response response;
        try {
            LocaleId srcLocaleId = new LocaleId(form.getSrcLocale());
            LocaleId transLocaleId = new LocaleId(form.getTransLocale());

            List<Glossary> glossaries =
                    glossaryFileServiceImpl
                            .parseGlossaryFile(form.getFileStream(),
                                    form.getFileName(), srcLocaleId,
                                    transLocaleId);
            for (Glossary glossary : glossaries) {
                glossaryFileServiceImpl.saveOrUpdateGlossary(glossary);
            }

            Type genericType = new GenericType<List<Glossary>>() {
            }.getGenericType();
            Object entity =
                    new GenericEntity<List<Glossary>>(glossaries,
                            genericType);
            response =
                    Response.ok()
                            .header("Content-Disposition",
                                    "attachment; filename=\""
                                            + form.getFileName() + "\"")
                            .type(MediaType.TEXT_PLAIN).entity(entity).build();
            return response;
        } catch (ZanataServiceException e) {
            log.error(e.toString(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(e).build();
        }
    }

    @Override
    public Response deleteEntry(String resId) {
        identity.checkPermission("", "glossary-delete");

        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        HGlossaryEntry entry = glossaryDAO.getEntryByResId(resId);

        if(entry != null) {
            glossaryDAO.makeTransient(entry);
            glossaryDAO.flush();
            return Response.ok(resId).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                .entity("Glossary " + resId + "entry not found").build();
        }
    }

    @Deprecated
    @Override
    public Response deleteAllEntries() {
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
        GlossaryEntry glossaryEntry = new GlossaryEntry(hGlossaryEntry.getResId());
        glossaryEntry.setSrcLang(hGlossaryEntry.getSrcLocale().getLocaleId());
        glossaryEntry.setSourceReference(hGlossaryEntry.getSourceRef());
        glossaryEntry.setPos(hGlossaryEntry.getPos());
        glossaryEntry.setDescription(hGlossaryEntry.getDescription());
        glossaryEntry.setTermsCount(hGlossaryEntry.getGlossaryTerms().size());
        return glossaryEntry;
    }

    public static GlossaryTerm generateGlossaryTerm(HGlossaryTerm hGlossaryTerm) {
        GlossaryTerm glossaryTerm = new GlossaryTerm();
        glossaryTerm.setContent(hGlossaryTerm.getContent());
        glossaryTerm.setLocale(hGlossaryTerm.getLocale().getLocaleId());

        String name = "";
        if(hGlossaryTerm.getLastModifiedBy() != null) {
            name = hGlossaryTerm.getLastModifiedBy().getName();
        }
        glossaryTerm.setLastModifiedBy(name);
        glossaryTerm.setLastModifiedDate(hGlossaryTerm.getLastChanged());
        glossaryTerm.setComment(hGlossaryTerm.getComment());

        return glossaryTerm;
    }
}
