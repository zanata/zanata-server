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
package org.zanata.page;

import lombok.extern.slf4j.Slf4j;
import org.jboss.arquillian.graphene.page.Location;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import static org.jboss.arquillian.graphene.Graphene.waitGui;

@Slf4j
@Location("/signin")
public class SignInPage {

    public static final String LOGIN_FAILED_ERROR = "Login failed";

    @FindBy(id = "loginForm:username")
    private WebElement usernameField;

    @FindBy(id = "loginForm:password")
    private WebElement passwordField;

    @FindBy(id = "loginForm:loginButton")
    private WebElement signInButton;

    public void enterUsername(String username) {
        log.info("Enter username {}", username);
        waitGui().until().element(usernameField).is().visible();
        usernameField.sendKeys(username);
    }

    public void enterPassword(String password) {
        log.info("Enter password {}", password);
        waitGui().until().element(passwordField).is().visible();
        passwordField.sendKeys(password);
    }

    public void clickSignIn() {
        log.info("Click Sign In");
        waitGui().until().element(signInButton).is().visible();
        signInButton.click();
    }
}
