package org.zanata.rest.service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.UriInfo;

import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang.StringUtils;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.zanata.common.GlossarySortField;
import org.zanata.common.LocaleId;
import org.zanata.dao.GlossaryDAO;
import org.zanata.model.HGlossaryEntry;
import org.zanata.model.HGlossaryTerm;
import org.zanata.model.HLocale;
import org.zanata.rest.dto.Glossary;
import org.zanata.rest.dto.GlossaryEntry;
import org.zanata.rest.dto.GlossaryLocale;
import org.zanata.rest.dto.GlossaryLocaleStats;
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

    @In
    private LocaleService localeServiceImpl;

    @Override
    public Response getLocaleStatistic() {
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }

        HLocale srcLocale = localeServiceImpl.getByLocaleId(LocaleId.EN_US);
        int entryCount =
                glossaryDAO.getEntryCountBySourceLocales(LocaleId.EN_US);

        GlossaryLocale srcGlossaryLocale =
                new GlossaryLocale(generateLocaleDetails(srcLocale), entryCount);

        Map<LocaleId, Integer> transMap = glossaryDAO.getTranslationLocales();

        List<HLocale> supportedLocales =
            localeServiceImpl.getSupportedLocales();

        List<GlossaryLocale> transLocale = Lists.newArrayList();

        for(HLocale locale: supportedLocales) {
            LocaleDetails localeDetails = generateLocaleDetails(locale);
            int count = transMap.containsKey(locale.getLocaleId()) ?
                transMap.get(locale.getLocaleId()) : 0;

            transLocale.add(new GlossaryLocale(localeDetails, count));
        }

        GlossaryLocaleStats localeStats =
            new GlossaryLocaleStats(srcGlossaryLocale, transLocale);

        return Response.ok(localeStats).build();
    }

    private LocaleDetails generateLocaleDetails(HLocale locale) {
        return new LocaleDetails(locale.getLocaleId(),
            locale.retrieveDisplayName(), "");
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

    private List<GlossarySortField> convertToSortField(
        String commaSeparatedFields) {
        List<GlossarySortField> result = Lists.newArrayList();

        String[] fields = StringUtils.split(commaSeparatedFields, ",");
        if(fields == null || fields.length <= 0) {
            //default sorting
            result.add(GlossarySortField.src_content);
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
    public Response get(@PathParam("srcLocale") LocaleId srcLocale,
        @PathParam("transLocale") LocaleId transLocale,
        @DefaultValue("-1") @QueryParam("page") int page,
        @DefaultValue("-1") @QueryParam("sizePerPage") int sizePerPage,
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

        Glossary glossary = new Glossary();

        transferEntriesLocaleResource(hGlosssaryEntries, glossary, transLocale);

        return Response.ok(glossary).build();
    }

    @Override
    public Response get(LocaleId srcLocaleId,
        @DefaultValue("-1") @QueryParam("page") int page,
        @DefaultValue("-1") @QueryParam("sizePerPage") int sizePerPage,
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

        Glossary glossary = new Glossary();

        //filter out all terms other than source term
        transferEntriesLocaleResource(hGlosssaryEntries, glossary, srcLocaleId);

        return Response.ok(glossary).build();
    }

    @Override
    public Response put(Glossary glossary) {
        identity.checkPermission("", "glossary-insert");

        // must be a create operation
        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }
        response = Response.created(uri.getAbsolutePath());

        glossaryFileServiceImpl.saveOrUpdateGlossary(glossary);

        return response.build();
    }

    @Override
    public Response upload(LocaleId srcLocaleId, LocaleId transLocaleId,
        MultipartFormDataInput input) {
        identity.checkPermission("", "glossary-insert");

        ResponseBuilder response = request.evaluatePreconditions();
        if (response != null) {
            return response.build();
        }
        response = Response.created(uri.getAbsolutePath());

        try {
            Map<String, List<InputPart>> formParts = input.getFormDataMap();
            List<InputPart> inPart = formParts.get("file");
            String fileName = "";

            for (InputPart inputPart : inPart) {
                MultivaluedMap<String, String> headers = inputPart.getHeaders();
                fileName = parseFileName(headers);
                InputStream stream =
                        inputPart.getBody(InputStream.class, null);

                List<Glossary> glossaries =
                        glossaryFileServiceImpl
                                .parseGlossaryFile(stream, fileName,
                                        srcLocaleId, transLocaleId);

                for (Glossary glossary : glossaries) {
                    glossaryFileServiceImpl.saveOrUpdateGlossary(glossary);
                }
            }
            return response.build();
        } catch (IOException e) {
            log.error(e.toString(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(e).build();
        }
    }

    // Parse Content-Disposition header to get the original file name
    private String parseFileName(MultivaluedMap<String, String> headers) {
        String[] contentDispositionHeader =
                headers.getFirst("Content-Disposition").split(";");
        for (String name : contentDispositionHeader) {
            if ((name.trim().startsWith("filename"))) {
                String[] tmp = name.split("=");
                String fileName = tmp[1].trim().replaceAll("\"", "");
                return fileName;
            }
        }
        return "randomName";
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
            glossaryDAO.getEntryByResIdAndLocale(resId, localeId);

        if(entry != null) {
            glossaryDAO.makeTransient(entry);
        }
        glossaryDAO.flush();
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
