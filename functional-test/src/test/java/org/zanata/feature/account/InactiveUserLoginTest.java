/*
 * Copyright 2014, Red Hat, Inc. and individual contributors as indicated by the
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

import lombok.extern.slf4j.Slf4j;
import org.junit.After;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.subethamail.wiser.WiserMessage;
import org.zanata.feature.Feature;
import org.zanata.feature.testharness.ZanataTestCase;
import org.zanata.feature.testharness.TestPlan.DetailedTest;
import org.zanata.page.account.InactiveAccountPage;
import org.zanata.page.account.SignInPage;
import org.zanata.page.utility.HomePage;
import org.zanata.util.AddUsersRule;
import org.zanata.util.EmailQuery;
import org.zanata.util.EnsureLogoutRule;
import org.zanata.util.HasEmailRule;
import org.zanata.util.RetryRule;
import org.zanata.workflow.BasicWorkFlow;
import org.zanata.workflow.LoginWorkFlow;
import org.zanata.workflow.RegisterWorkFlow;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * @author Carlos Munoz <a
 *         href="mailto:camunoz@redhat.com">camunoz@redhat.com</a>
 */
@Category(DetailedTest.class)
@Slf4j
public class InactiveUserLoginTest extends ZanataTestCase {

    @Rule
    public AddUsersRule addUsersRule = new AddUsersRule();

    @ClassRule
    public static HasEmailRule hasEmailRule = new HasEmailRule();

    @Rule
    public EnsureLogoutRule ensureLogoutRule = new EnsureLogoutRule();

    @ClassRule
    public static RetryRule retryRule = new RetryRule(0);

    @Before
    public void beforeTest() {
        new BasicWorkFlow().goToHome().deleteCookiesAndRefresh();
    }

    @After
    public void afterTest() {
        hasEmailRule.purgeMessages();
        new BasicWorkFlow().goToHome().deleteCookiesAndRefresh();
    }

    @Feature(summary = "The user needs to verify their account before they " +
            "may log in",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 181714)
    @Test(timeout = MAX_SHORT_TEST_DURATION)
    public void verifyAccount() throws Exception {
        new RegisterWorkFlow().registerInternal("tester",
                "tester", "tester", "tester@test.com");
        InactiveAccountPage inactiveAccountPage = new LoginWorkFlow()
                .signInInactive("tester", "tester");

        assertThat(inactiveAccountPage.getTitle())
                .isEqualTo("Zanata: Inactive account")
                .as("The account is inactive");

        WiserMessage message = hasEmailRule.getMessages().get(0);

        assertThat(EmailQuery.hasActivationLink(message))
                .isTrue()
                .as("The email contains the activation link");

        SignInPage signInPage = new BasicWorkFlow()
                .goToUrl(EmailQuery.getActivationLink(message),
                        SignInPage.class);

        assertThat(signInPage.getNotificationMessage())
                .isEqualTo(SignInPage.ACTIVATION_SUCCESS)
                .as("The account was activated");

        assertThat(new LoginWorkFlow().signIn("tester", "tester")
                .loggedInAs())
                .isEqualTo("tester")
                .as("The user has validated their account and logged in");
    }

    @Feature(summary = "The user can resend the account activation email",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 181714)
    @Test(timeout = MAX_SHORT_TEST_DURATION)
    public void resendActivationEmail() throws Exception {
        new RegisterWorkFlow().registerInternal("tester",
                "tester", "tester", "tester@test.com");
        HomePage homePage = new LoginWorkFlow()
                .signInInactive("tester", "tester")
                .clickResendActivationEmail();

        assertThat(homePage.getNotificationMessage())
                .isEqualTo(HomePage.SIGNUP_SUCCESS_MESSAGE)
                .as("The message sent notification is displayed");

        assertThat(hasEmailRule.getMessages().size())
                .isEqualTo(2)
                .as("A second email was sent");

        WiserMessage message = hasEmailRule.getMessages().get(1);

        assertThat(EmailQuery.hasActivationLink(message))
                .isTrue()
                .as("The second email contains the activation link");

        SignInPage signInPage = new BasicWorkFlow()
                .goToUrl(EmailQuery.getActivationLink(message),
                        SignInPage.class);

        assertThat(signInPage.getNotificationMessage())
                .isEqualTo(SignInPage.ACTIVATION_SUCCESS)
                .as("The account was activated");

        assertThat(new LoginWorkFlow().signIn("tester", "tester")
                .loggedInAs())
                .isEqualTo("tester")
                .as("The user has validated their account and logged in");
    }

    @Feature(summary = "The user can change the account activation " +
            "email address",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 181714)
    @Test(timeout = MAX_SHORT_TEST_DURATION)
    public void changeActivationEmail() throws Exception {
        new RegisterWorkFlow().registerInternal("tester",
                "tester", "tester", "tester@test.com");
        InactiveAccountPage inactiveAccountPage = new LoginWorkFlow()
                .signInInactive("tester", "tester");

        assertThat(hasEmailRule.getMessages().get(0).getEnvelopeReceiver())
                .isEqualTo("tester@test.com")
                .as("The first email is correct");

        HomePage homePage = inactiveAccountPage
                .enterNewEmail("newtester@test.com")
                .clickUpdateEmail();

        assertThat(homePage.getNotificationMessage())
                .isEqualTo(HomePage.SIGNUP_EMAIL_UPDATED)
                .as("The email updated message is displayed");
        assertThat(hasEmailRule.getMessages().size())
                .isEqualTo(2)
                .as("A second email was sent");

        WiserMessage message = hasEmailRule.getMessages().get(1);

        assertThat(EmailQuery.hasActivationLink(message))
                .isTrue()
                .as("The second email contains the activation link");

        SignInPage signInPage = new BasicWorkFlow()
                .goToUrl(EmailQuery.getActivationLink(message),
                        SignInPage.class);

        assertThat(signInPage.getNotificationMessage())
                .isEqualTo(SignInPage.ACTIVATION_SUCCESS)
                .as("The account was activated");

        assertThat(new LoginWorkFlow().signIn("tester", "tester")
                .loggedInAs())
                .isEqualTo("tester")
                .as("The user has validated their account and logged in");
    }
}
