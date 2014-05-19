/*
 * Copyright 2014, Red Hat, Inc. and individual contributors
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
package org.zanata.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map.Entry;

import javax.persistence.OptimisticLockException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Response;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.hibernate.StaleStateException;
import org.jboss.seam.Component;
import org.jboss.seam.servlet.ContextualHttpServletRequest;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.zanata.file.GlobalDocumentId;
import org.zanata.file.SourceDocumentUpload;
import org.zanata.rest.DocumentFileUploadForm;
import org.zanata.rest.dto.ChunkUploadResponse;
import org.zanata.service.TranslationFileService;
import org.zanata.service.impl.TranslationFileServiceImpl;

import static com.google.common.base.Strings.isNullOrEmpty;

/**
 * Endpoint for upload dialogs using multi-file upload forms.
 *
 */
public class MultiFileUploadServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private SourceDocumentUpload sourceUploader;
    private TranslationFileService translationFileServiceImpl;

    private static final Logger log = LoggerFactory
            .getLogger(MultiFileUploadServlet.class);

    @Override
    public void init(ServletConfig config) {
    }

    @Override
    protected void doPost(final HttpServletRequest request,
            final HttpServletResponse response) throws ServletException,
            IOException {
        new ContextualHttpServletRequest(request) {
            @Override
            public void process() throws Exception {
                processPost(request, response);
            }
        }.run();
    }

    private void processPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        if (ServletFileUpload.isMultipartContent(req)) {
            processMultipartPost(req, resp);
        } else {
            log.error("File upload received non-multipart request");
            resp.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE,
                    "Unsupported request type. File upload supports only multipart requests.");
        }
    }

    public void processMultipartPost(HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        sourceUploader = (SourceDocumentUpload) Component.getInstance(SourceDocumentUpload.class);
        translationFileServiceImpl = (TranslationFileService) Component.getInstance(TranslationFileServiceImpl.class);

        if (translationFileServiceImpl == null) {
            log.error("translationFileServiceImpl is null");
        }

        String projectSlug = request.getParameter("p");
        String versionSlug = request.getParameter("v");


        // Create a factory for disk-based file items
        FileItemFactory factory = new DiskFileItemFactory();
        ServletFileUpload uploadHandler = new ServletFileUpload(factory);

        response.setContentType("application/json");
        PrintWriter writer = response.getWriter();

        List<FileItem> items;
        try {
            items = uploadHandler.parseRequest(request);
        } catch (FileUploadException e) {
            JSONObject responseObject = new JSONObject();
            try {
                responseObject.put("error", "upload failed: " + e.getMessage());
            } catch (JSONException je) {
                log.error("Error while generating JSON", je);
            }
            writer.write(responseObject.toString());
            writer.close();
            return;
        }

        JSONArray filesJson = new JSONArray();

        String path = "";
        String lang = "en-US";
        String fileParams = "";

        // Make sure params are available before processing files
        for (FileItem item : items) {
            if (item.isFormField()) {
                String field = item.getFieldName();
                String value = item.getString();
                if (field.equals("filepath")) {
                    path = value;
                } else if (field.equals("filelang")) {
                    lang = value;
                } else if (field.equals("fileparams")) {
                    fileParams = value;
                }
            }
        }

        for (FileItem item : items) {
            if (!item.isFormField()) {
                JSONObject jsono =
                        processFileItem(item, projectSlug, versionSlug,
                                path, fileParams);
                filesJson.put(jsono);
            }
        }
        JSONObject responseObject = new JSONObject();
        try {
            responseObject.put("files", filesJson);
        } catch (JSONException e) {
            log.error("error adding files list to JSON", e);
        }
        String responseString = responseObject.toString();
        log.info("response string: " + responseString);
        writer.write(responseString);
        writer.close();

        // FIXME this needs to be very robust so it doesn't risk taking down the server
        //       so I should really wrap it in a catch Exception that will print error
        //       stack trace and return a response with error to the server.
    }

    public JSONObject processFileItem(FileItem item, String projectSlug,
            String versionSlug, String path, String fileParams) {
        String docId = translationFileServiceImpl.generateDocId(path, item.getName());

        GlobalDocumentId id = new GlobalDocumentId(projectSlug, versionSlug, docId);
        DocumentFileUploadForm form = new DocumentFileUploadForm();
        form.setAdapterParams(fileParams);
        form.setFirst(true);
        form.setLast(true);
        form.setSize(item.getSize());
        form.setFileType(translationFileServiceImpl.extractExtension(item.getName()));

        String error;
        String success = null;
        try {
            form.setFileStream(item.getInputStream());
            Response resp = sourceUploader.tryUploadSourceFileWithoutHash(id, form);
            ChunkUploadResponse responseEntity = (ChunkUploadResponse) resp.getEntity();
            error = responseEntity.getErrorMessage();
            success = responseEntity.getSuccessMessage();
        } catch (IOException e) {
            error = "could not access file data";
        } catch (OptimisticLockException e) {
            error = "failed: concurrent upload";
        } catch (StaleStateException e) {
            // this happens in the same circumstances as OptimisticLockException
            // but is thrown because we are using hibernate directly rather than
            // through JPA.
            error = "failed: concurrent upload";
        }

        JSONObject jsono = new JSONObject();

        try {
            jsono.put("name", docId);
            jsono.put("size", item.getSize());
            if (!isNullOrEmpty(error)) {
                if (error.equals("Valid combination of username and api-key for this server were not included in the request.")) {
                    error = "not logged in";
                }
                jsono.put("error", error);
            } else {
                if (!isNullOrEmpty(success)) {
                    jsono.put("message", success);
                }
                // TODO could provide REST URL for this file
//                            jsono.put("url", "upload?getfile=" + item.getName());
            }
        } catch (JSONException e) {
            log.error("Error while generating JSON", e);
        }
        return jsono;
    }

}
