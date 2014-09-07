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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.zanata.util.ZanataRestCaller.buildSourceResource;
import static org.zanata.util.ZanataRestCaller.buildTextFlow;
import static org.zanata.util.ZanataRestCaller.buildTextFlowTarget;
import static org.zanata.util.ZanataRestCaller.buildTranslationResource;

import lombok.extern.slf4j.Slf4j;

import org.hamcrest.Matchers;
import org.junit.Rule;
import org.junit.Test;
import org.zanata.common.LocaleId;
import org.zanata.rest.dto.resource.Resource;
import org.zanata.rest.dto.resource.TranslationsResource;
import org.zanata.util.SampleProjectRule;
import org.zanata.util.ZanataRestCaller;

@Slf4j
public class ExperimentTest {
    @Rule
    public SampleProjectRule sampleProjectRule = new SampleProjectRule();

    @Test
    public void canFindText() {
        String linkText = "master\n   Documents: 0";
        System.out.println(linkText);
        String stripNewLine = linkText.replaceAll("\\n", " ");
        System.out.println(stripNewLine);
        boolean matches = stripNewLine.matches("master\\s+Documents.+");
        assertThat(matches, Matchers.equalTo(true));
    }

    // @Test
    public void canDoCampbell() {
        // #. Tag: para
        // #, no-c-format
        // msgid "Describes Fedora, the Fedora Project, and how you can help."
        // msgstr ""
        String tag = "#. Tag: para";
        String msgCtx = "#, no-c-format";
        String msgId = "msgid \"This is string number %d. \"";
        String msgStr = "msgstr \"%s %d\"";
        String potMsgStr = "msgstr \"\"";

        for (int i = 55; i > 0; i--) {
            System.out.println(tag);
            System.out.println(msgCtx);
            System.out.printf(msgId, i);
            System.out.println();
            System.out.printf(potMsgStr);
            // System.out.printf(msgStr, "translated string number", i);
            System.out.println();
            System.out.println();
        }
    }

//    @Test
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
        restCaller.postSourceDocResource(projectSlug, iterationSlug, sourceResource, false);
        restCaller.postTargetDocResource(projectSlug, iterationSlug, docId,
                new LocaleId("pl"), transResource, "auto");
    }
}
