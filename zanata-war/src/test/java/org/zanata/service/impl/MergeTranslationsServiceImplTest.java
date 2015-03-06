/*
 * Copyright 2015, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;

import java.util.concurrent.Future;

import org.dbunit.operation.DatabaseOperation;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.zanata.ZanataDbunitJpaTest;
import org.zanata.dao.ProjectIterationDAO;
import org.zanata.dao.TextFlowTargetDAO;
import org.zanata.file.FileSystemPersistService;
import org.zanata.model.HProjectIteration;
import org.zanata.seam.SeamAutowire;
import org.zanata.security.ZanataIdentity;

@Test(groups = { "business-tests" })
public class MergeTranslationsServiceImplTest extends ZanataDbunitJpaTest {
    private SeamAutowire seam = SeamAutowire.instance();

    @Mock
    private ZanataIdentity identity;

    @Mock
    private FileSystemPersistService fileSystemPersistService;

    private ProjectIterationDAO projectIterationDAO;

    private TextFlowTargetDAO textFlowTargetDAO;

    private MergeTranslationsServiceImpl service;

    private final String projectSlug = "sample-project";

    @Override
    protected void prepareDBUnitOperations() {
        beforeTestOperations.add(new DataSetOperation(
                "org/zanata/test/model/ClearAllTables.dbunit.xml",
                DatabaseOperation.CLEAN_INSERT));
        beforeTestOperations.add(new DataSetOperation(
                "org/zanata/test/model/AccountData.dbunit.xml",
                DatabaseOperation.CLEAN_INSERT));
        beforeTestOperations.add(new DataSetOperation(
                "org/zanata/test/model/LocalesData.dbunit.xml",
                DatabaseOperation.CLEAN_INSERT));
        beforeTestOperations.add(new DataSetOperation(
                "org/zanata/test/model/MergeTranslationsData.dbunit.xml",
                DatabaseOperation.CLEAN_INSERT));
    }

    @BeforeMethod
    protected void beforeMethod() throws Exception {
        MockitoAnnotations.initMocks(this);

        projectIterationDAO = new ProjectIterationDAO(getSession());
        textFlowTargetDAO = new TextFlowTargetDAO(getSession());

        service = seam.reset()
                .use("projectIterationDAO", projectIterationDAO)
                .use("textFlowTargetDAO", textFlowTargetDAO)
                .use("entityManager", getEm())
                .use("session", getSession())
                .use("identity", identity)
                .useImpl(VersionStateCacheImpl.class)
                .useImpl(TranslationStateCacheImpl.class)
                .ignoreNonResolvable()
                .autowire(MergeTranslationsServiceImpl.class);
    }

    @Test
    public void testCopyVersionNotExist() {
        String sourceVersionSlug = "1.0";
        String targetVersionSlug = "non-exist-version";
        Future<Void> future = service.startMergeTranslations(projectSlug,
            sourceVersionSlug, projectSlug, targetVersionSlug, true, null);
        verifyZeroInteractions(identity);
        assertThat(future).isEqualTo(null);
    }

    @Test
    public void testCopyVersionEmptyDoc() {
        String sourceVersionSlug = "1.0";
        String targetVersionSlug = "3.0";
        Future<Void> future = service.startMergeTranslations(projectSlug,
            sourceVersionSlug, projectSlug, targetVersionSlug, true, null);
        verifyZeroInteractions(identity);
        assertThat(future).isEqualTo(null);
    }

    @Test
    public void testCopyVersion() {
        String sourceVersionSlug = "1.0";
        String targetVersionSlug = "2.0";
        boolean useLatestTranslatedString = false;

        HProjectIteration expectedSourceVersion = projectIterationDAO.getBySlug(
            projectSlug, sourceVersionSlug);
        assertThat(expectedSourceVersion).isNotNull();

        HProjectIteration expectedTargetVersion = projectIterationDAO.getBySlug(
            projectSlug, targetVersionSlug);
        assertThat(expectedTargetVersion).isNotNull();


        MergeTranslationsServiceImpl spyService = spy(service);
        spyService.startMergeTranslations(projectSlug, sourceVersionSlug,
                projectSlug, targetVersionSlug, useLatestTranslatedString, null);

        verify(spyService).mergeTranslationBatch(Matchers.eq(
                expectedSourceVersion.getId()),
                Matchers.eq(expectedTargetVersion.getId()),
                Matchers.eq(useLatestTranslatedString),
                Matchers.anyInt(), Matchers.anyInt());

        // check generated comments
        // check use latest translated if enabled
        // check non translated/approved is not being used
    }

    @Test
    public void testDocIdAndContentHash() {
        /**
         * this test is covered by @see org.zanata.dao.TextFlowTargetDAOTest#
         * testGetTranslationsByMatchedContext
         *
         * check different docId won't copy
         * check different tf.contentHash won't copy
         */
    }
}
