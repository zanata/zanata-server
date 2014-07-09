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
package org.zanata.feature.account;

import org.junit.After;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.subethamail.wiser.WiserMessage;
import org.zanata.feature.Feature;
import org.zanata.feature.testharness.ZanataTestCase;
import org.zanata.feature.testharness.TestPlan.DetailedTest;
import org.zanata.page.account.RegisterPage;
import org.zanata.page.dashboard.dashboardsettings.DashboardAccountTab;
import org.zanata.page.dashboard.dashboardsettings.DashboardClientTab;
import org.zanata.page.dashboard.dashboardsettings.DashboardProfileTab;
import org.zanata.page.utility.HomePage;
import org.zanata.util.AddUsersRule;
import org.zanata.util.Constants;
import org.zanata.util.EmailQuery;
import org.zanata.util.HasEmailRule;
import org.zanata.util.PropertiesHolder;
import org.zanata.workflow.BasicWorkFlow;
import org.zanata.workflow.LoginWorkFlow;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * @author Damian Jansen <a
 *         href="mailto:djansen@redhat.com">djansen@redhat.com</a>
 */
@Category(DetailedTest.class)
public class ProfileTest extends ZanataTestCase {

    @Rule
    public AddUsersRule addUsersRule = new AddUsersRule();

    @ClassRule
    public static HasEmailRule hasEmailRule = new HasEmailRule();

    private static final String adminsApiKey = "b6d7044e9ee3b2447c28fb7c50d86d98";
    private static final String serverUrl = PropertiesHolder
                .getProperty(Constants.zanataInstance.value());

    @After
    public void afterTest() {
        new BasicWorkFlow().goToHome().deleteCookiesAndRefresh();
        hasEmailRule.purgeMessages();
    }

    @Feature(summary = "The user can view their account client settings",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 392574)
    @Test(timeout = ZanataTestCase.MAX_SHORT_TEST_DURATION)
    public void verifyProfileData() throws Exception {
        DashboardClientTab dashboardClientTab = new LoginWorkFlow()
                .signIn("admin", "admin")
                .goToSettingsTab()
                .goToSettingsClientTab();

        assertThat(dashboardClientTab.getApiKey()).isEqualTo(adminsApiKey)
                .as("The correct api key is present");

        assertThat(dashboardClientTab.getConfigurationDetails())
                .contains("localhost.url="+serverUrl)
                .as("The configuration url is correct");

        assertThat(dashboardClientTab.getConfigurationDetails())
                .contains("localhost.username=admin")
                .as("The configuration username is correct");

        assertThat(dashboardClientTab.getConfigurationDetails())
                .contains("localhost.key=".concat(adminsApiKey))
                .as("The configuration api key is correct");
    }

    @Feature(summary = "The user can change their API key",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds =  392569)
    @Test(timeout = ZanataTestCase.MAX_SHORT_TEST_DURATION)
    public void changeUsersApiKey() throws Exception {
        DashboardClientTab dashboardClientTab = new LoginWorkFlow()
                .signIn("translator", "translator")
                .goToSettingsTab()
                .goToSettingsClientTab();
        String currentApiKey = dashboardClientTab.getApiKey();
        dashboardClientTab = dashboardClientTab.pressApiKeyGenerateButton();

        dashboardClientTab.waitForApiKeyChanged(currentApiKey);

        assertThat(dashboardClientTab.getApiKey()).isNotEqualTo(currentApiKey)
                .as("The user's api key is different");

        assertThat(dashboardClientTab.getApiKey()).isNotEmpty()
                .as("The user's api key is not empty");

        assertThat(dashboardClientTab.getConfigurationDetails())
                .contains("localhost.key="
                        .concat(dashboardClientTab.getApiKey()))
                .as("The configuration api key matches the label");
    }

    @Feature(summary = "The user can view their profile",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 86819)
    @Test(timeout = ZanataTestCase.MAX_SHORT_TEST_DURATION)
    public void viewUserProfile() throws Exception {
        DashboardProfileTab dashboardProfileTab = new LoginWorkFlow()
                .signIn("translator", "translator")
                .goToSettingsTab()
                .goToSettingsProfileTab();

        assertThat(dashboardProfileTab.getUsername())
                .isEqualTo("translator")
                .as("The user's username is visible");
        assertThat(dashboardProfileTab.getDisplayName())
                .isEqualTo("translator")
                .as("The user's name is visible");
    }

    @Feature(summary = "The user can change their display name",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 86822)
    @Test(timeout = ZanataTestCase.MAX_SHORT_TEST_DURATION)
    public void changeUsersName() throws Exception {
        DashboardProfileTab dashboardProfileTab = new LoginWorkFlow()
                .signIn("translator", "translator")
                .goToSettingsTab()
                .goToSettingsProfileTab()
                .enterName("Tranny")
                .clickUpdateProfileButton();

        dashboardProfileTab.waitForUsernameChanged("translator");

        assertThat(dashboardProfileTab.getUserFullName()).isEqualTo("Tranny")
                .as("The user's name has been changed");
    }

    @Feature(summary = "The user must enter a valid email address change " +
            "to change it",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 392578)
    @Test(timeout = ZanataTestCase.MAX_SHORT_TEST_DURATION)
    public void emailValidationIsUsedOnProfileEdit() throws Exception {
        DashboardAccountTab dashboardAccountTab = new LoginWorkFlow()
                .signIn("translator", "translator")
                .goToSettingsTab()
                .gotoSettingsAccountTab()
                .typeNewAccountEmailAddress("admin@example.com")
                .clickUpdateEmailButton();

        assertThat(dashboardAccountTab.expectError(
                    DashboardAccountTab.EMAIL_TAKEN_ERROR))
                .contains(DashboardAccountTab.EMAIL_TAKEN_ERROR)
                .as("The email is rejected, being already taken");

        dashboardAccountTab = dashboardAccountTab
                .goToMyDashboard()
                .goToSettingsTab()
                .gotoSettingsAccountTab()
                .typeNewAccountEmailAddress("test @example.com")
                .clickUpdateEmailButton();

        assertThat(dashboardAccountTab.expectError(
                    RegisterPage.MALFORMED_EMAIL_ERROR))
                .contains(RegisterPage.MALFORMED_EMAIL_ERROR)
                .as("The email is rejected, being of invalid format");
    }

    @Feature(summary = "The user can change their email address",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 392576)
    @Test(timeout = ZanataTestCase.MAX_SHORT_TEST_DURATION)
    public void changeEmailAddress() throws Exception {
        DashboardAccountTab dashboardAccountTab = new LoginWorkFlow()
                .signIn("translator", "translator")
                .goToSettingsTab()
                .gotoSettingsAccountTab()
                .typeNewAccountEmailAddress("translator@something.com")
                .clickUpdateEmailButton();

        assertThat(dashboardAccountTab
                .expectNotification(DashboardAccountTab.EMAIL_CHANGED))
                .isTrue()
                .as("The user is notified of the change");

        WiserMessage message = hasEmailRule.getMessages().get(0);

        assertThat(message.getEnvelopeReceiver())
                .isEqualTo("translator@something.com")
                .as("The new email address is the verification mail target");

        assertThat(EmailQuery.hasEmailVerificationLink(message))
                .isTrue()
                .as("The email has an activation link");

        dashboardAccountTab = new BasicWorkFlow()
                .goToUrl(EmailQuery.getEmailVerificationLink(message),
                    HomePage.class)
                .goToMyDashboard()
                .goToSettingsTab()
                .gotoSettingsAccountTab();

        assertThat(dashboardAccountTab.getEmailAddress())
                .isEqualTo("translator@something.com")
                .as("The email was changed");
    }

    @Feature(summary = "The user must enter a unique value to change " +
            "their email address",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 392577)
    @Test(timeout = ZanataTestCase.MAX_SHORT_TEST_DURATION)
    public void changedEmailAddressIsUnique() throws Exception {
        DashboardAccountTab dashboardAccountTab = new LoginWorkFlow()
                .signIn("translator", "translator")
                .goToSettingsTab()
                .gotoSettingsAccountTab()
                .typeNewAccountEmailAddress("admin@example.com")
                .clickUpdateEmailButton();

        assertThat(dashboardAccountTab
                .expectError(DashboardAccountTab.EMAIL_TAKEN_ERROR))
                .contains(DashboardAccountTab.EMAIL_TAKEN_ERROR)
                .as("The 'email is taken' error is displayed");
    }
}
