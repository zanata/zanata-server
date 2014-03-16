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
import org.jboss.seam.Component;
import org.jboss.seam.servlet.ContextualHttpServletRequest;
//import org.json.JSONArray;
//import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.zanata.file.GlobalDocumentId;
import org.zanata.file.SourceDocumentUpload;
import org.zanata.rest.DocumentFileUploadForm;
import org.zanata.rest.dto.ChunkUploadResponse;
import org.zanata.service.TranslationFileService;
import org.zanata.service.impl.TranslationFileServiceImpl;

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

        Enumeration<String> paramNames = request.getParameterNames();

        while (paramNames.hasMoreElements()) {
            log.info("param: " + paramNames.nextElement());
        }

        log.info("project-version: " + projectSlug + ":" + versionSlug);

        // Create a factory for disk-based file items
        FileItemFactory factory = new DiskFileItemFactory();
        ServletFileUpload uploadHandler = new ServletFileUpload(factory);

        PrintWriter writer = response.getWriter();
        response.setContentType("application/json");
        JSONArray filesJson = new JSONArray();
        try {
            List<FileItem> items = uploadHandler.parseRequest(request);

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
        } catch (FileUploadException e) {
                throw new RuntimeException(e);
        } catch (Exception e) {
                throw new RuntimeException(e);
        } finally {
            JSONObject responseObject = new JSONObject();
            responseObject.put("files", filesJson);
            String responseString = responseObject.toString();
            log.info("response string: " + responseString);
            writer.write(responseString);
            writer.close();
        }
    }

    public JSONObject processFileItem(FileItem item, String projectSlug,
            String versionSlug, String path, String fileParams)
            throws IOException {
        String docId = translationFileServiceImpl.generateDocId(path, item.getName());

        GlobalDocumentId id = new GlobalDocumentId(projectSlug, versionSlug, docId);
        DocumentFileUploadForm form = new DocumentFileUploadForm();
        form.setAdapterParams(fileParams);
        form.setFirst(true);
        form.setLast(true);
        form.setSize(item.getSize());
        form.setFileStream(item.getInputStream());
        form.setFileType(translationFileServiceImpl.extractExtension(item.getName()));

        Response resp = sourceUploader.tryUploadSourceFileWithoutHash(id , form);
        ChunkUploadResponse responseEntity = (ChunkUploadResponse) resp.getEntity();

        String error = responseEntity.getErrorMessage();
        String success = responseEntity.getSuccessMessage();

        JSONObject jsono = new JSONObject();

        jsono.put("name", docId);
        jsono.put("size", item.getSize());
        if (error != null && !error.isEmpty()) {
            jsono.put("error", error);
        } else {
            if (success != null && !success.isEmpty()) {
                jsono.put("message", success);
            }
            // TODO could provide REST URL for this file
//                            jsono.put("url", "upload?getfile=" + item.getName());
        }
        return jsono;
    }


    // FIXME maven is having some issue with using org.json here,
    //       so these are just some quick replica classes to get things working
    //       until I have time to sort out the dependencies.
    private static class JSONObject extends HashMap<String, String> {

        @Override
        public String put(String key, String value) {
            return super.put(key, "\"" + value.replace("\"", "\\\"") + "\"");
        }

        public void put(String key, long value) {
            super.put(key, new Long(value).toString());
        }

        public void put(String key, JSONArray value) {
            super.put(key, value.toString());
        }

        @Override
        public String toString() {
            boolean first = true;
            String value = "{\n    ";
            for (Entry<String, String> e : entrySet()) {
                value += first ? "" : ",\n    ";
                first = false;
                value += "\"" + e.getKey() + "\": ";
                value += e.getValue();
            }
            value += "\n  }";
            return value;
        }
    }

    private static class JSONArray extends ArrayList<String> {

        public void put(JSONObject jsono) {
            add(jsono.toString());
        }

        @Override
        public String toString() {
            boolean first = true;
            String output = "[\n  ";
            for (String s : this) {
                output += first ? "" : ",\n  ";
                first = false;
                output += s;
            }
            output += "\n]";
            return output;
        }
    }

}
