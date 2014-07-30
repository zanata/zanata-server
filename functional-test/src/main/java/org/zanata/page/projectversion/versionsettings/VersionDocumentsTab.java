package org.zanata.page.projectversion.versionsettings;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.zanata.page.projectversion.VersionBasePage;
import org.zanata.page.projectversion.VersionLanguagesPage;

/**
 * @author Damian Jansen <a
 *         href="mailto:djansen@redhat.com">djansen@redhat.com</a>
 */
public class VersionDocumentsTab extends VersionBasePage {

    public VersionDocumentsTab(WebDriver driver) {
        super(driver);
    }

    public VersionDocumentsTab pressUploadFileButton() {
        clickLinkAfterAnimation(By.id("file-upload-component-toggle-button"));
        return new VersionDocumentsTab(getDriver());
    }

    /**
     * Query for the status of the upload button in the submit dialog
     *
     * @return boolean can submit file upload
     */
    public boolean canSubmitDocument() {
        return getDriver().findElement(
                By.id("uploadDocForm:generalDocSubmitUploadButton"))
                .isEnabled();
    }

    public VersionDocumentsTab cancelUpload() {
        getDriver().findElement(
                By.id("uploadDocForm:generalDocCancelUploadButton")).click();
        return new VersionDocumentsTab(getDriver());
    }

    public VersionDocumentsTab enterFilePath(String filePath) {
        // selenium action: a thing that you add steps to



        WebElement fileInput = getDriver().findElement(By.id("file-upload-component-file-input"));

        // THIS IS A HACK
        // Why would I do this?
        //   The 'browse files' click target to open the file input dialog is
        //   actually overlayed with a transparent file input element that
        //   receives the click. This is to get around the lack of styling
        //   ability of the file input element.
        //   To keep the test simple, I want to just enter a file path into
        //   the input element, rather than try to make selenium control the
        //   file selection dialog.

        // This hack makes the file input element visible by preventing its
        // parent having hidden overflow, and changing the element itself
        // be opaque.

//        WebElement container = fileInput.findElement(By.xpath(".."));
        JavascriptExecutor js = (JavascriptExecutor) getDriver();
        js.executeScript("arguments[0].style.opacity = 1; arguments[0].parentElement.style.overflow = '';", fileInput);

//        element.sendKeys(filePath);
        new Actions(getDriver()).sendKeys(fileInput, filePath).perform();

        return new VersionDocumentsTab(getDriver());
    }

    public VersionLanguagesPage submitUpload() {
        getDriver().findElement(
                By.id("file-upload-component-start-upload")).click();
        return new VersionLanguagesPage(getDriver());
    }

    public boolean sourceDocumentsContains(String document) {

        List<WebElement> documentLabelList =
                getDriver()
                        .findElement(By.id("settings-document_form"))
                        .findElement(By.tagName("ul"))
                        .findElements(
                                By.xpath(".//li/label[@class='form__checkbox__label']"));
        for (WebElement label : documentLabelList) {
            if (label.getText().contains(document)) {
                return true;
            }
        }
        return false;
    }
}
