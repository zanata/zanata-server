/*
 * Copyright 2010, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata;

import static org.zanata.util.ZanataRestCaller.buildSourceResource;
import static org.zanata.util.ZanataRestCaller.buildTextFlow;
import static org.zanata.util.ZanataRestCaller.buildTextFlowTarget;
import static org.zanata.util.ZanataRestCaller.buildTranslationResource;

import lombok.extern.slf4j.Slf4j;

import org.junit.Rule;
import org.zanata.common.LocaleId;
import org.zanata.rest.dto.resource.Resource;
import org.zanata.rest.dto.resource.TranslationsResource;
import org.zanata.util.SampleProjectRule;
import org.zanata.util.ZanataRestCaller;

/**
 * This is a class for experiment some things i.e. populate cargo instance with
 * some example users and languages so that a manual test can be performed.
 * Under normal circumstances it will have no active tests in it.
 */
@Slf4j
public class ExperimentTest {
    @Rule
    public SampleProjectRule sampleProjectRule = new SampleProjectRule();

    // @Test
    public void testPushTranslation() {
        ZanataRestCaller restCaller =
                new ZanataRestCaller();
        String projectSlug = "push-test";
        String iterationSlug = "master";
        String projectType = "gettext";
        restCaller.createProjectAndVersion(projectSlug, iterationSlug,
                projectType);

        String docId = "messages";
        Resource sourceResource = buildSourceResource(docId);
        TranslationsResource transResource = buildTranslationResource();
        int numOfMessages = 1000;
        for (int i = 0; i < numOfMessages; i++) {
            String resId = "res" + i;
            String content = "content" + i;
            sourceResource.getTextFlows().add(buildTextFlow(resId, content));
            transResource.getTextFlowTargets().add(
                    buildTextFlowTarget(resId, content));
        }
        restCaller.postSourceDocResource(projectSlug, iterationSlug,
                sourceResource, false);
        restCaller.postTargetDocResource(projectSlug, iterationSlug, docId,
                new LocaleId("pl"), transResource, "auto");
    }
}
