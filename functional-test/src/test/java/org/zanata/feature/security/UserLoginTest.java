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
package org.zanata.feature.security;

import org.junit.Rule;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.zanata.feature.Feature;
import org.zanata.feature.testharness.ZanataTestCase;
import org.zanata.feature.testharness.TestPlan.BasicAcceptanceTest;
import org.zanata.feature.testharness.TestPlan.DetailedTest;
import org.zanata.page.account.SignInPage;
import org.zanata.util.AddUsersRule;
import org.zanata.util.EnsureLogoutRule;
import org.zanata.util.HasEmailRule;
import org.zanata.workflow.LoginWorkFlow;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * @author Damian Jansen <a
 *         href="mailto:djansen@redhat.com">djansen@redhat.com</a>
 */
@Category(DetailedTest.class)
public class UserLoginTest extends ZanataTestCase {

    @Rule
    public HasEmailRule hasEmailRule = new HasEmailRule();

    @Rule
    public EnsureLogoutRule ensureLogoutRule = new EnsureLogoutRule();

    @Rule
    public AddUsersRule addUsersRule = new AddUsersRule();

    @Feature(summary = "The user can log in",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 86815)
    @Test(timeout = ZanataTestCase.MAX_SHORT_TEST_DURATION)
    @Category(BasicAcceptanceTest.class)
    public void signInSuccessful() throws Exception {
        assertThat(new LoginWorkFlow()
                .signIn("admin", "admin")
                .loggedInAs())
                .isEqualTo("admin")
                .as("User can log in");
    }

    @Feature(summary = "The user must enter a correct username and " +
            "password to log in",
            tcmsTestPlanIds = 5316, tcmsTestCaseIds = 86815)
    @Test(timeout = ZanataTestCase.MAX_SHORT_TEST_DURATION)
    @Category(BasicAcceptanceTest.class)
    public void signInFailure() throws Exception {
        assertThat(new LoginWorkFlow()
                .signInFailure("nosuchuser", "password")
                .expectError(SignInPage.LOGIN_FAILED_ERROR))
                .contains(SignInPage.LOGIN_FAILED_ERROR)
                .as("Log in error message is shown");
    }
}
