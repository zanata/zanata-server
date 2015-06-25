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

package org.zanata.dao;

import org.dbunit.operation.DatabaseOperation;
import org.junit.Before;
import org.junit.Test;
import org.zanata.ZanataDbunitJpaTest;
import org.zanata.common.LocaleId;
import org.zanata.model.HLocale;
import org.zanata.model.HTextFlowTarget;
import org.zanata.model.type.TranslationEntityType;
import org.zanata.model.type.TranslationSourceType;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public class TextFlowTargetDAOTest extends ZanataDbunitJpaTest {

    private HLocale as;
    private HLocale de;

    private TextFlowTargetDAO textFlowTargetDAO;

    private LocaleDAO localeDAO;

    @Before
    public void setup() {
        textFlowTargetDAO = new TextFlowTargetDAO(getSession());
        localeDAO = new LocaleDAO(getSession());
        as = localeDAO.findByLocaleId(new LocaleId("as"));
        de = localeDAO.findByLocaleId(new LocaleId("de"));
    }

    @Override
    protected void prepareDBUnitOperations() {
        beforeTestOperations.add(new DataSetOperation(
            "org/zanata/test/model/ClearAllTables.dbunit.xml",
            DatabaseOperation.CLEAN_INSERT));
        beforeTestOperations.add(new DataSetOperation(
            "org/zanata/test/model/AccountData.dbunit.xml",
            DatabaseOperation.CLEAN_INSERT));
        beforeTestOperations.add(new DataSetOperation(
            "org/zanata/test/model/ProjectsData.dbunit.xml",
            DatabaseOperation.CLEAN_INSERT));
        beforeTestOperations.add(new DataSetOperation(
            "org/zanata/test/model/TextFlowTestData.dbunit.xml",
            DatabaseOperation.CLEAN_INSERT));
        beforeTestOperations.add(new DataSetOperation(
            "org/zanata/test/model/LocalesData.dbunit.xml",
            DatabaseOperation.CLEAN_INSERT));
    }

    @Test
    public void entityTypeAndSourceTypeTest() {
        HTextFlowTarget target = textFlowTargetDAO.findById(2L);
        target.setEntityType(TranslationEntityType.TFT);
        target.setSourceType(TranslationSourceType.COPY_TRANS);

        target = textFlowTargetDAO.makePersistent(target);
        textFlowTargetDAO.flush();
        System.out.println(target);
    }
}
