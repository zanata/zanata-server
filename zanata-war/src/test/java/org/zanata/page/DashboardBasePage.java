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
import org.openqa.selenium.By;

@Slf4j
@Location("/dashboard")
public class DashboardBasePage extends BasePage {

    private By activityTab = By.id("activity_tab");
    private By projectsTab = By.id("projects_tab");
    private By settingsTab = By.id("settings_tab");
    private By settingsAccountTab = By.id("account_tab");
    private By settingsProfileTab = By.id("profile_tab");
    private By settingsClientTab = By.id("client_tab");
    private By todaysActivityTab = By.id("activity-today_tab");
    private By thisWeeksActivityTab = By.id("activity-week_tab");
    private By thisMonthsActivityTab = By.id("activity-month_tab");
    private By profileOverview = By.id("profile-overview");

    public final static String EMAIL_SENT =
            "You will soon receive an email with a link to activate your " +
                    "email account change.";

    public final static String PASSWORD_UPDATE_SUCCESS =
            "Your password has been successfully changed.";

}
