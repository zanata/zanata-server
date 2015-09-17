/*
 * Copyright 2010, Red Hat, Inc. and individual contributors
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
package org.zanata.rest.service.raw;

import java.io.InputStream;
import java.util.Collection;
import java.util.List;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;

import org.apache.commons.io.IOUtils;
import org.dbunit.operation.DatabaseOperation;
import org.jboss.arquillian.container.test.api.RunAsClient;
import org.jboss.resteasy.client.ClientRequest;
import org.jboss.resteasy.client.ClientResponse;
import org.junit.Test;
import org.zanata.RestTest;
import org.zanata.common.LocaleId;
import org.zanata.rest.GlossaryFileUploadForm;
import org.zanata.rest.MediaTypes;
import org.zanata.rest.ResourceRequest;
import org.zanata.rest.dto.Glossary;
import org.zanata.rest.dto.GlossaryEntry;
import org.zanata.rest.dto.GlossaryInfo;
import org.zanata.rest.dto.GlossaryTerm;

import com.google.common.base.Function;
import com.google.common.collect.Collections2;
import com.google.common.collect.Lists;

import static org.assertj.core.api.Assertions.assertThat;
import static org.zanata.provider.DBUnitProvider.DataSetOperation;
import static org.zanata.util.RawRestTestUtils.assertJaxbUnmarshal;
import static org.zanata.util.RawRestTestUtils.jaxbMarhsal;
import static org.zanata.util.RawRestTestUtils.jaxbUnmarshal;

public class GlossaryRawRestITCase extends RestTest {

    @Override
    protected void prepareDBUnitOperations() {
        addBeforeTestOperation(new DataSetOperation(
                "org/zanata/test/model/LocalesData.dbunit.xml",
                DatabaseOperation.CLEAN_INSERT));
        addBeforeTestOperation(new DataSetOperation(
                "org/zanata/test/model/GlossaryData.dbunit.xml",
                DatabaseOperation.CLEAN_INSERT));
        addBeforeTestOperation(new DataSetOperation(
                "org/zanata/test/model/AccountData.dbunit.xml",
                DatabaseOperation.CLEAN_INSERT));
    }

    @Test
    @RunAsClient
    public void getInfo() throws Exception {
        String url = "/glossary/info";
        new ResourceRequest(getRestEndpointUrl(url), "GET") {
            @Override
            protected void prepareRequest(ClientRequest request) {
                request.header(HttpHeaders.ACCEPT,
                    MediaTypes.APPLICATION_ZANATA_GLOSSARY_XML);
            }

            @Override
            protected void onResponse(ClientResponse response) {
                assertThat(response.getStatus()).isEqualTo(200);
                assertJaxbUnmarshal(response, GlossaryInfo.class);

                GlossaryInfo glossaryInfo =
                        jaxbUnmarshal(response, GlossaryInfo.class);

                assertThat(
                        glossaryInfo.getSrcLocale().getLocale().getLocaleId())
                        .isEqualTo(LocaleId.EN_US);
                assertThat(
                    glossaryInfo.getSrcLocale().getNumberOfTerms())
                    .isEqualTo(1);
            }
        }.run();
    }

    @Test
    @RunAsClient
    public void getEntriesForLocale() throws Exception {
        LocaleId srcLocale = LocaleId.EN_US;
        LocaleId transLocale = LocaleId.DE;
        String url = "/glossary/src/" + srcLocale.toString() + "/trans/" + transLocale.toString();

        new ResourceRequest(getRestEndpointUrl(url), "GET") {
            @Override
            protected void prepareRequest(ClientRequest request) {
                request.header(HttpHeaders.ACCEPT,
                    MediaTypes.APPLICATION_ZANATA_GLOSSARY_XML);
            }

            @Override
            protected void onResponse(ClientResponse response) {
                assertThat(response.getStatus()).isEqualTo(200);
                assertJaxbUnmarshal(response, Glossary.class);

                Glossary glossary = jaxbUnmarshal(response, Glossary.class);

                GlossaryEntry entry = glossary.getGlossaryEntries().get(0);
                assertThat(entry.getSourceReference()).isEqualTo("source reference");
                assertThat(entry.getSrcLang()).isEqualTo(LocaleId.EN_US);
                assertThat(entry.getGlossaryTerms()).hasSize(2);

                List<GlossaryTerm> expectedTerms = getExpectedTerms();

                Collection<String> allTermContents = Collections2.transform(
                    entry.getGlossaryTerms(),
                    new Function<GlossaryTerm, String>() {
                        @Override
                        public String apply(GlossaryTerm glossaryTerm) {
                            return glossaryTerm.getContent();
                        }
                    });

                assertThat(expectedTerms).extracting("content").containsAll(
                    allTermContents);
            }
        }.run();
    }

    @Test
    @RunAsClient
    public void getAllEntries() throws Exception {
        LocaleId srcLocale = LocaleId.EN_US;
        String url = "/glossary/src/" + srcLocale.toString();

        new ResourceRequest(getRestEndpointUrl(url), "GET") {
            @Override
            protected void prepareRequest(ClientRequest request) {
                request.header(HttpHeaders.ACCEPT,
                    MediaTypes.APPLICATION_ZANATA_GLOSSARY_XML);
            }

            @Override
            protected void onResponse(ClientResponse response) {
                assertThat(response.getStatus()).isEqualTo(200);
                assertJaxbUnmarshal(response, Glossary.class);

                Glossary glossary = jaxbUnmarshal(response, Glossary.class);

                GlossaryEntry entry = glossary.getGlossaryEntries().get(0);
                assertThat(entry.getSourceReference()).isEqualTo("source reference");
                assertThat(entry.getSrcLang()).isEqualTo(LocaleId.EN_US);
                assertThat(entry.getGlossaryTerms()).hasSize(1);

                List<GlossaryTerm> expectedTerms = getExpectedTerms();

                assertThat(expectedTerms).extracting("content").contains(
                    entry.getGlossaryTerms().get(0).getContent());
            }
        }.run();
    }

    @Test
    @RunAsClient
    public void retrieveNonExistingGlossarySrcLocale() throws Exception {
        LocaleId srcLocale = LocaleId.FR;
        String url = "/glossary/src/" + srcLocale.toString();

        new ResourceRequest(getRestEndpointUrl(url), "GET") {
            @Override
            protected void prepareRequest(ClientRequest request) {
                request.header(HttpHeaders.ACCEPT,
                    MediaTypes.APPLICATION_ZANATA_GLOSSARY_XML);
            }

            @Override
            protected void onResponse(ClientResponse response) {
                assertThat(response.getStatus()).isEqualTo(200);
                assertJaxbUnmarshal(response, Glossary.class);

                Glossary glossary = jaxbUnmarshal(response, Glossary.class);
                assertThat(glossary.getGlossaryEntries()).hasSize(0);
            }
        }.run();
    }

    @Test
    @RunAsClient
    public void put() throws Exception {
        final Glossary glossary = this.getSampleGlossary();

        new ResourceRequest(getRestEndpointUrl("/glossary"), "PUT",
            getAuthorizedEnvironment()) {
            @Override
            protected void prepareRequest(ClientRequest request) {
                request.body(MediaTypes.APPLICATION_ZANATA_GLOSSARY_XML,
                    jaxbMarhsal(glossary).getBytes());
            }

            @Override
            protected void onResponse(ClientResponse response) {
                assertThat(response.getStatus()).isEqualTo(200);
            }
        }.run();
    }

    @Test
    @RunAsClient
    public void deleteEntry() throws Exception {
        String resId = "resId1";
        String url = "/glossary/entries/" + resId;

        new ResourceRequest(getRestEndpointUrl(url), "DELETE",
            getAuthorizedEnvironment()) {
            @Override
            protected void prepareRequest(ClientRequest request) {
            }

            @Override
            protected void onResponse(ClientResponse response) {
                assertThat(response.getStatus()).isEqualTo(200); // Ok
            }
        }.run();
    }

    @Test
    @RunAsClient
    public void unauthorizedDeleteEntry() throws Exception {
        String resId = "resId1";
        String url = "/glossary/entries/" + resId;

        new ResourceRequest(getRestEndpointUrl(url), "DELETE") {
            @Override
            protected void prepareRequest(ClientRequest request) {
            }

            @Override
            protected void onResponse(ClientResponse response) {
                assertThat(response.getStatus()).isEqualTo(401); // Unauthorized
            }
        }.run();
    }

    private Glossary getSampleGlossary() {
        Glossary glossary = new Glossary();
        GlossaryEntry glossaryEntry1 = new GlossaryEntry();
        glossaryEntry1.setSrcLang(LocaleId.EN_US);
        glossaryEntry1.setSourceReference("TEST SOURCE REF DATA");

        GlossaryTerm glossaryTerm1 = new GlossaryTerm();
        glossaryTerm1.setLocale(LocaleId.EN_US);
        glossaryTerm1.setContent("TEST DATA 1 EN_US");
        glossaryTerm1.setComment("COMMENT 1");

        GlossaryTerm glossaryTerm2 = new GlossaryTerm();
        glossaryTerm2.setLocale(LocaleId.DE);
        glossaryTerm2.setContent("TEST DATA 2 DE");
        glossaryTerm2.setComment("COMMENT 2");

        glossaryEntry1.getGlossaryTerms().add(glossaryTerm1);
        glossaryEntry1.getGlossaryTerms().add(glossaryTerm2);

        GlossaryEntry glossaryEntry2 = new GlossaryEntry();
        glossaryEntry2.setSrcLang(LocaleId.EN_US);
        glossaryEntry2.setSourceReference("TEST SOURCE REF DATA2");

        GlossaryTerm glossaryTerm3 = new GlossaryTerm();
        glossaryTerm3.setLocale(LocaleId.EN_US);
        glossaryTerm3.setContent("TEST DATA 3 EN_US");
        glossaryTerm3.setComment("COMMENT 3");

        GlossaryTerm glossaryTerm4 = new GlossaryTerm();
        glossaryTerm4.setLocale(LocaleId.DE);
        glossaryTerm4.setContent("TEST DATA 4 DE");
        glossaryTerm4.setComment("COMMENT 4");

        glossaryEntry2.getGlossaryTerms().add(glossaryTerm3);
        glossaryEntry2.getGlossaryTerms().add(glossaryTerm4);

        glossary.getGlossaryEntries().add(glossaryEntry1);
        glossary.getGlossaryEntries().add(glossaryEntry2);

        return glossary;
    }

    private List<GlossaryTerm> getExpectedTerms() {
        List<GlossaryTerm> expectedTerms = Lists.newArrayList();
        GlossaryTerm expTerm = new GlossaryTerm();
        expTerm.setLocale(LocaleId.EN_US);
        expTerm.setContent("test data content 1 (source lang)");
        expTerm.setComment("test data comment 1");
        expectedTerms.add(expTerm);

        expTerm = new GlossaryTerm();
        expTerm.setLocale(LocaleId.DE);
        expTerm.setContent("test data content 2");
        expTerm.setComment("test data comment 2");
        expectedTerms.add(expTerm);

        expTerm = new GlossaryTerm();
        expTerm.setLocale(LocaleId.ES);
        expTerm.setContent("test data content 3");
        expTerm.setComment("test data comment 3");
        expectedTerms.add(expTerm);

        return expectedTerms;
    }
}
