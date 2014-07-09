package org.zanata.page.account;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.zanata.page.BasePage;
import org.zanata.page.utility.HomePage;

/**
 * @author Damian Jansen <a href="mailto:djansen@redhat.com">djansen@redhat.com</a>
 */
public class InactiveAccountPage extends BasePage {

    public InactiveAccountPage(WebDriver driver) {
        super(driver);
    }

    public HomePage clickResendActivationEmail() {
        getDriver().findElement(By.id("inactiveAccountForm:resendEmail"))
                .click();
        return new HomePage(getDriver());
    }

    public InactiveAccountPage enterNewEmail(String email) {
        getDriver().findElement(By.id("inactiveAccountForm:emailField:email"))
                .sendKeys(email);
        return new InactiveAccountPage(getDriver());
    }

    public HomePage clickUpdateEmail() {
        getDriver().findElement(By.id("inactiveAccountForm:updateEmail"))
                .click();
        return new HomePage(getDriver());
    }
}
