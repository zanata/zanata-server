/*
 * Copyright 2013, Red Hat, Inc. and individual contributors as indicated by the
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
package org.zanata.feature.endtoend;

import lombok.extern.slf4j.Slf4j;
import org.junit.Rule;
import org.junit.Test;
import org.junit.Before;
import org.junit.experimental.categories.Category;
import org.subethamail.wiser.WiserMessage;
import org.zanata.feature.testharness.TestPlan;
import org.zanata.feature.testharness.ZanataTestCase;
import org.zanata.page.account.SignInPage;
import org.zanata.page.dashboard.DashboardBasePage;
import org.zanata.page.languages.LanguagePage;
import org.zanata.page.projects.ProjectVersionsPage;
import org.zanata.page.projectversion.VersionDocumentsPage;
import org.zanata.page.utility.HomePage;
import org.zanata.page.webtrans.EditorPage;
import org.zanata.util.HasEmailRule;
import org.zanata.util.CleanDocumentStorageRule;
import org.zanata.util.TestFileGenerator;
import org.zanata.util.EmailQuery;
import org.zanata.workflow.BasicWorkFlow;
import org.zanata.workflow.LoginWorkFlow;


import java.io.File;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * @author Damian Jansen <a
 *         href="mailto:djansen@redhat.com">djansen@redhat.com</a>
 */
@Slf4j
@Category(TestPlan.DetailedTest.class)
public class UserEndToEndTest extends ZanataTestCase {

    private HomePage homePage;
    Map<String, String> fields;

    @Rule
    public HasEmailRule hasEmailRule = new HasEmailRule();

    @Rule
    public CleanDocumentStorageRule documentStorageRule =
            new CleanDocumentStorageRule();

    private TestFileGenerator testFileGenerator = new TestFileGenerator();

    @Before
    public void before() {
        fields = new HashMap<String, String>();
        fields.put("email", "test@example.com");
        fields.put("username", "testusername");
        fields.put("name", "testusername");
        fields.put("password", "testpassword");
        String documentStorageDirectory = CleanDocumentStorageRule
                .getDocumentStoragePath()
                .concat(File.separator)
                .concat("documents")
                .concat(File.separator);

        if (new File(documentStorageDirectory).exists()) {
            log.warn("Document storage directory exists (cleanup incomplete)");
        }

        homePage = new BasicWorkFlow().goToHome();
        homePage.deleteCookiesAndRefresh();
    }

    /**
     * Test that a user can sign up and create a project, with a translatable document
     * @throws Exception
     */
    @Test
    @Category(TestPlan.BasicAcceptanceTest.class)
    public void projectOwnerEndToEnd() throws Exception {
        File originalFile =
                testFileGenerator.generateTestFileWithContent(
                        "uploadedDocument", ".txt",
                        "This is a test file");
        String testFileName = originalFile.getName();

        homePage = homePage
                .goToRegistration()
                .setFields(fields)
                .register();

        assertThat(homePage.expectNotification(HomePage.SIGNUP_SUCCESS_MESSAGE))
                .as("Sign up is successful");

        WiserMessage message = hasEmailRule.getMessages().get(0);
        String activationLink = EmailQuery.getActivationLink(message);

        ProjectVersionsPage projectVersionsPage = new BasicWorkFlow()
                .goToUrl(activationLink, SignInPage.class)
                .enterUsername(fields.get("username"))
                .enterPassword(fields.get("password"))
                .clickSignIn()
                .goToProjects()
                .clickOnCreateProjectLink()
                .enterProjectId("myuserprject")
                .enterProjectName("myuserprject")
                .pressCreateProject();

        assertThat(projectVersionsPage.getProjectName().trim())
                .isEqualTo("myuserprject")
                .as("The project name is correct");

        projectVersionsPage = projectVersionsPage
                .gotoSettingsTab()
                .gotoSettingsGeneral()
                .enterProjectName("myuserproject")
                .updateProject()
                .goToProjects()
                .goToProject("myuserproject");

        assertThat(projectVersionsPage.getProjectName())
                .isEqualTo("myuserproject")
                .as("The project name has changed");

        VersionDocumentsPage versionDocumentsPage = projectVersionsPage.clickCreateVersionLink()
                .disableCopyFromVersion()
                .inputVersionId("myprojectversion")
                .saveVersion()
                .gotoSettingsTab()
                .gotoSettingsDocumentsTab()
                .pressUploadFileButton()
                .enterFilePath(originalFile.getAbsolutePath())
                .submitUpload()
                .clickUploadDone()
                .gotoDocumentTab()
                .expectSourceDocsContains(testFileName);

        assertThat(versionDocumentsPage.sourceDocumentsContains(testFileName))
                .isTrue()
                .as("Document shows in table");

        EditorPage editorPage = versionDocumentsPage
                .gotoLanguageTab()
                .translate("fr", testFileName);

        assertThat(editorPage.getMessageSourceAtRowIndex(0))
                .isEqualTo("This is a test file")
                .as("Document is correct");

        editorPage = editorPage.translateTargetAtRowIndex(0, "Ceci est un fichier de test")
                .approveTranslationAtRow(0);

        // Close and reopen the editor to test save
        editorPage.reload();

        assertThat(editorPage.getBasicTranslationTargetAtRowIndex(0))
                .isEqualTo("Ceci est un fichier de test");
    }

    /**
     * Test that a user can sign up and be added to a translation team, ready for translating other maintainer's
     * documents
     * @throws Exception
     */
    @Test
    @Category(TestPlan.BasicAcceptanceTest.class)
    public void newTranslatorEndToEnd() throws Exception {
        File originalFile =
                testFileGenerator.generateTestFileWithContent(
                        "uploadedDocumentIsInFilesystem", ".txt",
                        "This is a test file");

        homePage = homePage
                .goToRegistration()
                .setFields(fields)
                .register();

        assertThat(homePage.expectNotification(HomePage.SIGNUP_SUCCESS_MESSAGE))
                .as("Sign up is successful");

        WiserMessage message = hasEmailRule.getMessages().get(0);
        String activationLink = EmailQuery.getActivationLink(message);

        new BasicWorkFlow()
                .goToUrl(activationLink, SignInPage.class)
                .enterUsername(fields.get("username"))
                .enterPassword(fields.get("password"))
                .clickSignIn()
                .goToLanguages()
                .selectLanguage("fr")
                .clickMoreActions()
                .clickContactCoordinatorsButton()
                .enterMessage("I'm a French translator")
                .clickSend()
                .logout();

        message = hasEmailRule.getMessages().get(1);
        String emailContent = HasEmailRule.getEmailContent(message);
        assertThat(emailContent)
                .contains("Dear Language Team Coordinator")
                .contains("There is no coordinator for")
                .contains("I'm a French translator")
                .as("The email is to the language team coordinator");

        new LoginWorkFlow().signIn("admin", "admin")
                .goToLanguages()
                .selectLanguage("fr")
                .clickAddTeamMember()
                .searchPersonAndAddToTeam(fields.get("name"), LanguagePage.TeamPermission.Translator)
                .logout();

        DashboardBasePage dashboardBasePage = new LoginWorkFlow()
                .signIn(fields.get("username"), fields.get("password"));
        dashboardBasePage.waitForNotificationsGone();
        EditorPage editorPage = dashboardBasePage.enterSearch("about")
                .clickProjectSearchEntry("about fedora")
                .gotoVersion("master")
                .translate("fr", "About_Fedora");

        assertThat(editorPage.getMessageSourceAtRowIndex(0))
                .isEqualTo("This is a test file")
                .as("Document is correct");

        editorPage = editorPage.translateTargetAtRowIndex(0, "Ceci est un fichier de test")
                .saveTranslationAtRow(0);

        // Close and reopen the editor to test save
        editorPage.reload();

        assertThat(editorPage.getBasicTranslationTargetAtRowIndex(0))
                .isEqualTo("Ceci est un fichier de test");

    }
}
