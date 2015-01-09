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
package org.zanata.page;

import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import static org.jboss.arquillian.graphene.Graphene.waitGui;

/**
 * A Base Page is an extension of the Core Page, providing the navigation bar
 * and sidebar links common to most pages outside of the editor.
 *
 * @author Damian Jansen <a
 *         href="mailto:djansen@redhat.com">djansen@redhat.com</a>
 */
@Slf4j
public class BasePage extends CorePage {
    private final By NavMenuBy = By.id("nav-main");

    @FindBy(id = "projects_link")
    private WebElement projectsLink;

    @FindBy(id = "version-groups_link")
    private WebElement groupsLink;

    @FindBy(id = "languages_link")
    private WebElement languagesLink;

    @FindBy(id = "user--avatar")
    private WebElement userAvatar;

    @FindBy(id = "signin_link")
    private WebElement signInLink;

    @FindBy(id = "right_menu_sign_out_link")
    private WebElement signOutLink;
    //private static final By BY_DASHBOARD_LINK = By.id("dashboard");
    //private static final By BY_ADMINISTRATION_LINK = By.id("administration");

    public void clickSignInLink() {
        log.info("Click Log In");
        waitGui().until().element(signInLink).is().visible();
        signInLink.click();
    }

    public String loggedInAs() {
        log.info("Query logged in user name");
        waitGui().until().element(userAvatar).is().present();
        return userAvatar.getAttribute("data-original-title");
    }

    public void logout() {
        log.info("Click Log Out");
        userAvatar.click();
        waitGui().until().element(signOutLink).is().visible();
        signOutLink.click();
    }

}
