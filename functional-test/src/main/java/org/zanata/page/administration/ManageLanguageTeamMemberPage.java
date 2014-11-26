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
package org.zanata.page.administration;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.zanata.page.BasePage;
import org.zanata.util.Checkbox;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @author Patrick Huang <a
 *         href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@Slf4j
public class ManageLanguageTeamMemberPage extends BasePage {

    private By memberPanel = By.id("memberPanel");
    private By joinLanguageTeamButton = By.linkText("Join Language Team");
    private By addTeamMemberButton = By.id("addTeamMemberLink");
    private By addUserSearchInput = By.id("searchForm:searchField");
    private By addUserSearchButton = By.id("searchForm:searchBtn");
    private By personTable = By.id("resultForm:searchResults");
    private By addSelectedButton = By.id("addSelectedBtn");

    public ManageLanguageTeamMemberPage(WebDriver driver) {
        super(driver);
    }

    private String getMemberCount() {
        log.info("Query member count");
        return waitForWebElement(By.className("panel__heading"))
                .findElement(By.className("i--users")).getText().trim();
    }

    public List<String> getMemberUsernames() {
        log.info("Query username list");
        if (getMemberCount().equals("0")) {
            log.info("No members yet for this language");
            return Collections.emptyList();
        }
        List<String> names = new ArrayList<>();
        for (WebElement listEntry : waitForWebElement(memberPanel)
                .findElements(By.className("list__item--actionable"))) {
            names.add(listEntry.findElement(By.tagName("h3")).getText().trim());
        }
        return names;
    }

    public ManageLanguageTeamMemberPage joinLanguageTeam() {
        log.info("Click Join");
        waitForWebElement(joinLanguageTeamButton).click();
        // we need to wait for this join to finish before returning the page
        waitForAMoment().until(new Function<WebDriver, Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                return driver.findElements(joinLanguageTeamButton).isEmpty();
            }
        });
        return new ManageLanguageTeamMemberPage(getDriver());
    }

    public ManageLanguageTeamMemberPage clickMoreActions() {
        log.info("Click actions menu");
        waitForWebElement(By.className("panel__header__actions"))
                .findElement(By.className("i--ellipsis"))
                .click();
        return new ManageLanguageTeamMemberPage(getDriver());
    }

    public ManageLanguageTeamMemberPage clickAddTeamMember() {
        log.info("Click Add Team Member");
        waitForWebElement(addTeamMemberButton).click();
        return this;
    }

    public ManageLanguageTeamMemberPage searchPersonAndAddToTeam(
            final String personName) {
        log.info("Enter username search {}", personName);
        // Wait for the search field under the add user panel
        waitForWebElement(addUserSearchInput).sendKeys(personName);
        clickSearchDialogSearchButton();
        WebElement personEntry = getSearchedForUser(personName);
        log.info("Set checked as translator");
        Checkbox.of(getCheckboxRole(personEntry, "Translator")).check();
        clickSearchDialogAddSelected();
        closeSearchDialog();
        return confirmAdded(personName);
    }

    public ManageLanguageTeamMemberPage clickSearchDialogSearchButton() {
        log.info("Click search button");
        waitForWebElement(addUserSearchButton).click();
        slightPause();
        waitForPageSilence();
        return new ManageLanguageTeamMemberPage(getDriver());
    }

    public ManageLanguageTeamMemberPage clickSearchDialogAddSelected() {
        log.info("Click Add Selected");
        waitForWebElement(addSelectedButton).click();
        return new ManageLanguageTeamMemberPage(getDriver());
    }

    public ManageLanguageTeamMemberPage closeSearchDialog() {
        log.info("Click Close button");
        waitForWebElement(
                waitForWebElement(By.id("searchUserDialog")),
                By.className("modal__close")).click();
        return new ManageLanguageTeamMemberPage(getDriver());
    }

    private WebElement getSearchedForUser(final String username) {
        return waitForAMoment().until(new Function<WebDriver, WebElement>() {
            @Override
            public WebElement apply(WebDriver input) {
                WebElement mainTable = waitForWebElement(personTable)
                        .findElement(By.className("list--slat"));
                List<WebElement> rows = mainTable
                        .findElements(By.className("txt--mini"));
                rows.addAll(mainTable
                        .findElements(By.className("txt--meta")));
                for (WebElement row : rows) {
                    if (row.findElements(
                            By.className("bx--inline-block"))
                            .get(0).getText().startsWith(username)) {
                        return row;
                    }
                }
                return null;
            }
        });
    }

    private WebElement getCheckboxRole(WebElement listItem, String roleName) {
        for (WebElement box : listItem
                .findElement(By.className("list--horizontal"))
                .findElements(By.tagName("li"))) {
            if (box.getText().startsWith(roleName)) {
                return box.findElement(By.tagName("input"));
            }
        }
        throw new RuntimeException("Role " + roleName + " not found");
    }

    private ManageLanguageTeamMemberPage confirmAdded(
            final String personUsername) {
        // we need to wait for the page to refresh
        return refreshPageUntil(this, new Predicate<WebDriver>() {
            @Override
            public boolean apply(WebDriver driver) {
                return getMemberUsernames().contains(personUsername);
            }
        });
    }
}
