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
@Location("/")
public class HomePage extends BasePage {

    public static final String SIGNUP_SUCCESS_MESSAGE =
            "You will soon receive an email " +
            "with a link to activate your account.";

    @FindBy(id= "main_body_content")
    private WebElement mainBodyContent;

    @FindBy(linkText = "Edit Page Content")
    private WebElement editPageContentButton;

    @FindBy(linkText = "Edit Page Code")
    private WebElement editPageCodeButton;

    public void goToEditPageContent() {
        log.info("Click Edit Page Content");
        waitGui().until().element(editPageContentButton).is().enabled();
        editPageContentButton.click();
    }

    public void goToEditPageCode() {
        log.info("Click Edit Page Code");
        waitGui().until().element(editPageCodeButton).is().enabled();
        editPageCodeButton.click();
    }

    public String getMainBodyContent() {
        log.info("Query homepage content");
        waitGui().until().element(mainBodyContent).is().visible();
        return mainBodyContent.getText();
    }
}
