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
package org.zanata.page.webtrans;

import java.util.Collections;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.zanata.page.BasePage;
import org.zanata.util.WebElementUtil;

import com.google.common.base.Function;
import com.google.common.base.Predicate;

/**
 * @author Patrick Huang <a
 *         href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@Slf4j
public class EditorPage extends BasePage {
    private final By glossaryTableBy = By.id("gwt-debug-glossaryResultTable");
    private final By glossaryNoResultBy = By.id("gwt-debug-glossaryNoResult");

    @FindBy(id = "gwt-debug-transUnitTable")
    private WebElement transUnitTable;

    public enum Validations {
        HTML, JAVAVARIABLES, NEWLINE, POSITIONAL, PRINTF, TABS, XML
    }

    public EditorPage(WebDriver driver) {
        super(driver);
    }

    public EditorPage searchGlossary(final String term) {
        waitForTenSec().until(new Predicate<WebDriver>() {
            @Override
            public boolean apply(WebDriver input) {
                return input.findElements(glossaryNoResultBy).size() == 1
                        || input.findElements(glossaryTableBy).size() == 1;
            }
        });
        WebElement searchBox =
                getDriver().findElement(By.id("gwt-debug-glossaryTextBox"));
        searchBox.clear();
        searchBox.sendKeys(term);
        WebElement searchButton =
                getDriver()
                        .findElement(By.id("gwt-debug-glossarySearchButton"));
        searchButton.click();
        return this;
    }

    /**
     * First row is header: SourceTerm, TargetTerm, Action, Details.
     * @return a table representing the searchResultTable
     */
    public List<List<String>> getGlossaryResultTable() {
        return waitForTenSec().until(
                new Function<WebDriver, List<List<String>>>() {
                    @Override
                    public List<List<String>> apply(WebDriver input) {
                        if (input.findElements(glossaryNoResultBy).size() == 1) {
                            return Collections.emptyList();
                        }
                        List<List<String>> resultTable =
                                WebElementUtil.getTwoDimensionList(input,
                                        glossaryTableBy);
                        log.info("glossary result: {}", resultTable);
                        return resultTable;
                    }
                });
    }

    /**
     * Enters text into the first available translation target
     * @param text
     *            Text to be entered
     * @return a new EditorPage
     */
    public EditorPage enterTextInFirstTarget(String text) {
        waitForTenSec().until(new Function<WebDriver, Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                driver.findElements(By.tagName("pre")).get(1).click();
                return driver.findElements(By.tagName("pre")).get(1)
                        .isEnabled();
            }
        });
        WebElement element = getDriver().findElements(By.tagName("pre")).get(1);
        new Actions(getDriver()).moveToElement(element).sendKeys(text)
                .perform();
        try {
            Thread.sleep(1000); // A validation action may occur!
        } catch (InterruptedException ie) {
            // Do nothing
        }
        return new EditorPage(getDriver());
    }

    /**
     * Get the text from the first translation target field, assuming it exists
     * and is enabled.
     * @return String from translation field
     */
    public String getTextInFirstTarget() {
        waitForTenSec().until(new Function<WebDriver, Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                return getDriver().findElements(By.tagName("pre")).get(1)
                        .isEnabled();
            }
        });
        return getDriver().findElements(By.tagName("pre")).get(1).getText();
    }

    /**
     * Return the validation message e.g. Warnings: 0, Errors: 1 from the first
     * entry in the translation target column and, if visible, the detailed
     * warnings and errors.
     * @return the full string from the validation message
     */
    public String getValidationMessageFirstTarget() {
        return getDriver().findElements(By.className("gwt-DisclosurePanel"))
                .get(1).getText();
    }

    /**
     * Query whether the first validation messages box is displayed
     * @return is/not displayed
     */
    public boolean isValidationMessageFirstTargetVisible() {
        return getDriver().findElements(By.className("gwt-DisclosurePanel"))
                .get(1).isDisplayed();
    }

    /**
     * Click the validation text box to show errors and warnings. Assumes the
     * text box exists and waits for it to expand.
     * @return new Editor page
     */
    public EditorPage openValidationBox() {
        getDriver().findElements(By.className("gwt-DisclosurePanel")).get(1)
                .click();
        waitForTenSec().until(new Function<WebDriver, Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                String errorText = getValidationMessageFirstTarget();
                return errorText.contains("Unexpected")
                        || errorText.contains("Target");
            }
        });
        return new EditorPage(getDriver());
    }

    /**
     * Opens the validation options sidebar
     * @return new EditorPage
     */
    public EditorPage openValidationOptions() {
        getDriver().findElement(By.className("icon-check")).click();
        waitForPanel("Validation options");
        return new EditorPage(getDriver());
    }

    /**
     * Click a validation option
     * @param validation
     *            the option to click
     * @return new EditorPage
     */
    public EditorPage clickValidationCheckbox(Validations validation) {
        String checkTitle = getValidationTitle(validation);
        waitForPanel("Validation options");
        getDriver().findElement(By.xpath("//*[@title='" + checkTitle + "']"))
                .findElement(By.tagName("input")).click();
        return new EditorPage(getDriver());
    }

    /**
     * Check if a validation option is available
     * @param validation
     *            the option to check
     * @return new EditorPage
     */
    public boolean validationOptionIsAvailable(Validations validation) {
        String checkTitle = getValidationTitle(validation);
        waitForPanel("Validation options");
        return getDriver()
                .findElement(By.xpath("//*[@title='" + checkTitle + "']"))
                .findElement(By.tagName("input")).isEnabled();
    }

    /**
     * Check if a validation option is selected
     * @param validation
     *            the option to check
     * @return new EditorPage
     */
    public boolean validationOptionIsSelected(Validations validation) {
        String checkTitle = getValidationTitle(validation);
        waitForPanel("Validation options");
        return getDriver()
                .findElement(By.xpath("//*[@title='" + checkTitle + "']"))
                .findElement(By.tagName("input")).isSelected();
    }

    private String getValidationTitle(Validations validation) {
        switch (validation) {
        case HTML:
            return "Check that XML/HTML tags are consistent";
        case JAVAVARIABLES:
            return "Check that java style ({x}) variables are consistent";
        case NEWLINE:
            return "Check for consistent leading and trailing newline (\\n)";
        case POSITIONAL:
            return "Check that positional printf style "
                    + "(%n$x) variables are consistent";
        case PRINTF:
            return "Check that printf style (%x) variables are consistent";
        case TABS:
            return "Check whether source and target have the same "
                    + "number of tabs";
        case XML:
            return "Check that XML entity are complete";
        default:
            throw new RuntimeException("Unknown validation!");
        }
    }

    private void waitForPanel(final String panelName) {
        waitForTenSec().until(new Function<WebDriver, Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                for (WebElement target : getDriver().findElements(
                        By.className("gwt-sideMenu-header"))) {
                    String check = (String) ((JavascriptExecutor) driver)
                        .executeScript(
                                "return arguments[0].innerHTML;", target);
                    if (check.equals(panelName) && target.isDisplayed()) {
                        return true;
                    }
                }
                return false;
            }
        });
    }
}
