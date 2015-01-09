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
package org.zanata.feature;

import org.dbunit.operation.DatabaseOperation;
import org.jboss.arquillian.container.test.api.RunAsClient;
import org.jboss.arquillian.drone.api.annotation.Drone;
import org.jboss.arquillian.graphene.page.InitialPage;
import org.jboss.arquillian.graphene.page.Page;
import org.jboss.arquillian.junit.Arquillian;
import org.jboss.arquillian.junit.InSequence;
import org.jboss.arquillian.persistence.ShouldMatchDataSet;
import org.jboss.arquillian.test.api.ArquillianResource;
import org.jboss.arquillian.test.spi.TestResult;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.jboss.arquillian.persistence.UsingDataSet;
import org.openqa.selenium.WebDriver;
import org.zanata.RestTest;
import org.zanata.action.LoginAction;
import org.zanata.page.BasePage;
import org.zanata.page.DashboardBasePage;
import org.zanata.page.HomePage;
import org.zanata.page.SignInPage;
import org.zanata.provider.DBUnitProvider;

import javax.persistence.PersistenceContext;
import java.net.URL;

import static org.assertj.core.api.Assertions.assertThat;
/**
 * @author Carlos Munoz <a href="mailto:camunoz@redhat.com">camunoz@redhat.com</a>
 */
@RunWith(Arquillian.class)
@RunAsClient
@UsingDataSet({"org/zanata/test/model/AccountData.dbunit.xml", "datasets/users.yaml"})
public class LoginITCase {

    private boolean preconsOn = false;

    @ArquillianResource
    protected URL deploymentUrl;

    @Drone
    WebDriver driver;   // This has random "unexpected call" exceptions for a
                        // (presumably) non-ready driver, if placed in the test
                        // function params

    @Page
    private SignInPage signInPage;

    @Page
    private DashboardBasePage dashboardBasePage;

    @Page
    private BasePage basePage;

    @Test
    @UsingDataSet("datasets/users.yaml") // I can't seem to get this to work!
    @InSequence(1)
    public void test_login(@InitialPage HomePage homePage) {
        driver.get(deploymentUrl.toExternalForm());
        homePage.clickSignInLink();
        signInPage.enterUsername("admin");
        signInPage.enterPassword("admin");
        signInPage.clickSignIn();
        /*assertThat(dashboardBasePage.loggedInAs())
                .isEqualTo("Administrator")
                .as("Administrator logged in");*/
    }

    @Test
    @InSequence(2)
    public void test_logout(@InitialPage HomePage homePage) {
        if (preconsOn) {
            // Can this be done?
            // Get result of test 1 'test_login' and assert/assume on PASSED
            TestResult.Status whatsTheStatusOfTheTestNamedTestLogin = TestResult.Status.PASSED;
            assertThat(whatsTheStatusOfTheTestNamedTestLogin)
                    .isEqualTo(TestResult.Status.PASSED)
                    .as("http://i.imgur.com/kY3Y5jp.png");
        }
        driver.get(deploymentUrl.toExternalForm());
        homePage.clickSignInLink();
        signInPage.enterUsername("admin");
        signInPage.enterPassword("admin");
        signInPage.clickSignIn();
        if (preconsOn) {
            basePage.logout(); // Just pass for now
            // Assert logged in as nobody
        }
    }
}
