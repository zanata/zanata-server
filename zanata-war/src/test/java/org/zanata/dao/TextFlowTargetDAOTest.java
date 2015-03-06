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
package org.zanata.dao;

import lombok.extern.slf4j.Slf4j;

import org.dbunit.operation.DatabaseOperation;
import org.hibernate.Session;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.zanata.ZanataDbunitJpaTest;
import org.zanata.common.ContentState;
import org.zanata.model.HProjectIteration;
import org.zanata.model.HTextFlowTarget;

import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Test(groups = { "jpa-tests" })
@Slf4j
public class TextFlowTargetDAOTest extends ZanataDbunitJpaTest {

    private TextFlowTargetDAO textFlowTargetDAO;

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

    @BeforeMethod(firstTimeOnly = true)
    public void setup() {
        textFlowTargetDAO =
                new TextFlowTargetDAO((Session) getEm().getDelegate());
    }

    @Test
    public void testGetTranslationsByMatchedContext() {

        Collection<ContentState> states = ContentState.TRANSLATED_STATES;
        String projectSlug = "sample-project";

        String fromVersionSlug = "1.0";
        String toVersionSlug = "2.0";

        ProjectIterationDAO projectIterationDAO = new
                ProjectIterationDAO((Session) getEm().getDelegate());

        HProjectIteration fromVersion =
                projectIterationDAO.getBySlug(projectSlug, fromVersionSlug);
        assertThat(fromVersion).isNotNull();

        HProjectIteration toVersion =
                projectIterationDAO.getBySlug(projectSlug, toVersionSlug);
        assertThat(toVersion).isNotNull();

        List<HTextFlowTarget[]> results =
                textFlowTargetDAO.getTranslationsByMatchedContext(
                        fromVersion.getId(), toVersion.getId(), 0, 100, states);

        assertThat(results).isNotEmpty();

        for(HTextFlowTarget[] result: results) {
            assertThat(result[0].getState()).isIn(states);
            assertThat(result[0].getTextFlow().getContentHash()).isEqualTo(
                    result[1].getTextFlow().getContentHash());
            assertThat(result[0].getTextFlow().getDocument().getDocId())
                    .isEqualTo(result[1].getTextFlow().getDocument().getDocId());
            assertThat(result[0].getLocale()).isEqualTo(result[1].getLocale());
            assertThat(result[0]).isNotEqualTo(result[1]);
        }
    }

}
