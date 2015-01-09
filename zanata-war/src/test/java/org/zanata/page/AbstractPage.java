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

import com.google.common.base.Function;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.Alert;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.WebDriver;

import java.util.Set;

import static org.jboss.arquillian.graphene.Graphene.waitGui;

/**
 * The base class for the page driver. Contains functionality not generally of
 * a user visible nature.
 */
@Slf4j
public class AbstractPage {
    
    private WebDriver driver;

    public AbstractPage(WebDriver driver) {
        this.driver = driver;
    }

    public WebDriver driver() {
        return this.driver;
    }

    public void reload() {
        log.info("Sys: Reload");
        driver.navigate().refresh();
    }

    public void deleteCookiesAndRefresh() {
        log.info("Sys: Delete cookies, reload");
        driver.manage().deleteAllCookies();
        Set<Cookie> cookies = driver.manage().getCookies();
        if (cookies.size() > 0) {
            log.warn("Failed to delete cookies: {}", cookies);
        }
        driver.navigate().refresh();
    }

    public String getUrl() {
        return driver.getCurrentUrl();
    }

    public Alert switchToAlert() {
        return waitGui().until(new Function<WebDriver, Alert>() {
            @Override
            public Alert apply(WebDriver driver) {
                try {
                    return driver.switchTo().alert();
                }
                catch (NoAlertPresentException noAlertPresent) {
                    return null;
                }
            }
        });
    }
}
