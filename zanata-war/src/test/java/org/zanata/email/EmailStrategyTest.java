/*
 * Copyright 2014, Red Hat, Inc. and individual contributors
 * as indicated by the @author tags. See the copyright.txt file in the
 * distribution for a full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package org.zanata.email;

import static javax.mail.Message.RecipientType.TO;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Collection;
import java.util.Properties;

import javax.mail.BodyPart;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import com.google.common.base.Joiner;
import com.google.common.collect.Lists;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.zanata.action.NewProfileAction;
import org.zanata.action.PasswordResetRequestAction;
import org.zanata.action.UserAction;
import org.zanata.action.UserSettingsAction;
import org.zanata.common.ProjectType;
import org.zanata.i18n.Messages;
import org.zanata.service.impl.EmailServiceImpl;
import org.zanata.webtrans.shared.model.ProjectIterationId;

/**
 * @author Sean Flanigan <a href="mailto:sflaniga@redhat.com">sflaniga@redhat.com</a>
 */
public class EmailStrategyTest {
    // use this if you want to see the real messages on stderr
    private static final boolean DEBUG = false;

    // context values needed for most/all templates:
    Messages msgs = DEBUG ? new Messages() : new Messages() {
        @Override
        public String get(Object key) {
            return "MSG:key=" + key;
        }

        @Override
        public String format(String key, Object... args) {
            return get(key) + ",args={" + Joiner.on(',').join(args) + "}";
        }
    };
    String fromAddress = "zanata@example.com";
    String fromName = "SERVER_NAME[测试]";
    String toName = "User Name[测试]";
    String toAddress = "username@example.com";
    String serverPath = "https://zanata.example.com";
    InternetAddress toAddr;
    InternetAddress[] toAddresses;

    Session session = Session.getDefaultInstance(new Properties());
    EmailBuilder.Context context = new EmailBuilder.Context() {
        @Override
        String getFromAddress() {
            return fromAddress;
        }

        @Override
        String getServerPath() {
            return serverPath;
        }

        @Override
        String getFromName() {
            return fromName;
        }
    };
    EmailBuilder builder = new EmailBuilder(session, context, msgs);
    MimeMessage message;

    // context values needed for some templates:
    String key = "123456";
    String fromLoginName = "LOGIN_NAME[测试]";
    String replyEmail = "REPLY_EMAIL[测试]";
    String userSubject = "USER_SUBJECT[测试]";
    String localeId = "LOCALE_ID";
    String localeNativeName = "LOCALE_NAME[测试]";
    String htmlMessage = "some <b>HTML</b>";

    public EmailStrategyTest() throws UnsupportedEncodingException {
        toAddr = new InternetAddress(toAddress, toName);
        toAddresses = new InternetAddress[] { toAddr };
    }

    @BeforeMethod(alwaysRun = true)
    private void beforeMethod() {
        message = new MimeMessage(session);
    }

    private String extractHtmlPart(MimeMessage message)
            throws IOException, MessagingException {
        if (DEBUG) {
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            message.writeTo(os);
            System.err.println(os.toString("UTF-8"));
        }

        Multipart multipart = (Multipart) message.getContent();
        // one for html, one for text
        assertThat(multipart.getCount()).isEqualTo(2);
        // NB this assumes that HTML is first
        BodyPart htmlPart = multipart.getBodyPart(0);
        assertThat(htmlPart.getDataHandler().getContentType()).isEqualTo(
                "text/html; charset=UTF-8");
        String htmlContent = (String) htmlPart.getContent();

        BodyPart textPart = multipart.getBodyPart(1);
        assertThat(textPart.getDataHandler().getContentType()).isEqualTo(
                "text/plain; charset=UTF-8");

        return htmlContent;
    }

    private void checkFromAndTo(MimeMessage message) throws MessagingException {
        assertThat(message.getFrom()).extracting("address").contains(
                fromAddress);
        assertThat(message.getFrom()).extracting("personal").contains(
                fromName);
        assertThat(message.getRecipients(TO)).extracting("address").contains(
                toAddress);
        assertThat(message.getRecipients(TO)).extracting("personal").contains(
                toName);
    }

    private void checkGenericTemplate(String html) {
        // a message from the generic email template:
        assertThat(html).contains(msgs.get(
                "jsf.email.GeneratedFromZanataServerAt"));
    }


    @Test
    public void activation() throws Exception {
        EmailBuilderStrategy strategy =
                new EmailServiceImpl.ActivationEmailStrategy(key);

        builder.buildMessage(message, strategy, toAddresses, "activation test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(msgs.get(
                "jsf.email.activation.Subject"));

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        assertThat(html).contains(msgs.get(
                "jsf.email.activation.ClickLinkToActivateAccount"));
        assertThat(html).contains(
                serverPath + "/account/activate/123456");
    }

    @Test
    public void contactAdmin() throws Exception {
        EmailBuilderStrategy strategy =
                new EmailServiceImpl.ContactAdminEmailStrategy(
                        fromLoginName, fromName, replyEmail, userSubject,
                        htmlMessage);

        builder.buildMessage(message, strategy, toAddresses, "contactAdmin test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(msgs.format(
                "jsf.email.admin.SubjectPrefix", fromLoginName) +
                " " + userSubject);

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        assertThat(html).contains(msgs.format(
                "jsf.email.admin.UserMessageIntro", fromName, fromLoginName));
        assertThat(html).contains(
                htmlMessage);
    }

    @Test
    public void contactLanguageCoordinator() throws Exception {
        EmailBuilderStrategy strategy =
                new EmailServiceImpl.ContactLanguageCoordinatorEmailStrategy(
                        fromLoginName, fromName, replyEmail, userSubject,
                        localeId, localeNativeName, htmlMessage);

        builder.buildMessage(message, strategy, toAddresses,
                "contactLanguageCoordinator test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(msgs.format(
                "jsf.email.coordinator.SubjectPrefix", localeId, fromLoginName) +
                " " + userSubject);

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        assertThat(html).contains(msgs.format(
                "jsf.email.coordinator.UserMessageIntro",
                fromName, fromLoginName, localeId, localeNativeName));
        assertThat(html).contains(
                htmlMessage);
        assertThat(html).contains(
                serverPath + "/language/view/" + localeId);
    }

    @Test
    public void emailActivation() throws Exception {
        EmailBuilderStrategy strategy =
                new NewProfileAction.EmailActivationEmailStrategy(key);

        builder.buildMessage(message, strategy, toAddresses,
                "emailActivation test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(msgs.get(
                "jsf.email.activation.Subject"));

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        assertThat(html).contains(msgs.get(
                "jsf.email.activation.ClickLinkToActivateAccount"));
        assertThat(html).contains(
                serverPath + "/account/activate/123456");
    }

    @Test
    public void emailValidation() throws Exception {
        EmailBuilderStrategy strategy =
                new UserSettingsAction.EmailValidationEmailStrategy(key);

        builder.buildMessage(message, strategy, toAddresses,
                "emailValidation test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(msgs.get(
                "jsf.email.accountchange.Subject"));

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        // a message from the template:
        assertThat(html).contains(msgs.get(
                "jsf.email.accountchange.ConfirmationLink"));
        assertThat(html).contains(
                serverPath + "/account/validate_email/123456");
    }

    @Test
    public void passwordReset() throws Exception {
        EmailBuilderStrategy strategy =
                new PasswordResetRequestAction.PasswordResetEmailStrategy(key);

        builder.buildMessage(message, strategy, toAddresses,
                "passwordReset test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(msgs.get(
                "jsf.email.passwordreset.Subject"));

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        assertThat(html).contains(msgs.get(
                "jsf.email.passwordreset.FollowLinkToResetPassword"));
        assertThat(html).contains(
                serverPath + "/account/password_reset/123456");
    }

    @Test
    public void requestRoleLanguage() throws Exception {
        EmailBuilderStrategy strategy =
                new EmailServiceImpl.RequestRoleLanguageEmailStrategy(
                        fromLoginName, fromName, replyEmail,
                        localeId, localeNativeName, htmlMessage,
                        true, true, true);

        builder.buildMessage(message, strategy, toAddresses,
                "requestRoleLanguage test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(
                msgs.format("jsf.email.rolerequest.Subject", fromLoginName, localeId));

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        assertThat(html).contains(msgs.format(
                "jsf.email.rolerequest.UserRequestingRole",
                fromName, fromLoginName, localeId, localeNativeName));
        assertThat(html).contains(
                htmlMessage);
        assertThat(html).contains(
                serverPath + "/language/view/" + localeId);
    }

    @Test
    public void requestToJoinLanguage() throws Exception {
        EmailBuilderStrategy strategy =
                new EmailServiceImpl.RequestToJoinLanguageEmailStrategy(
                        fromLoginName, fromName, replyEmail,
                        localeId, localeNativeName, htmlMessage,
                        true, true, true);

        builder.buildMessage(message, strategy, toAddresses,
                "requestToJoinLanguage test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(msgs.format(
                "jsf.email.joinrequest.Subject", fromLoginName, localeId));

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        assertThat(html).contains(msgs.format(
                "jsf.email.joinrequest.UserRequestingToJoin",
                fromName, fromLoginName, localeId, localeNativeName));
        assertThat(html).contains(
                htmlMessage);
        assertThat(html).contains(
                serverPath + "/language/view/" + localeId);
    }

    @Test
    public void requestToJoinVersionGroup() throws Exception {
        String versionGroupName = "GROUP_NAME[测试]";
        String versionGroupSlug = "GROUP_SLUG";
        Collection<ProjectIterationId> projectIterIds = Lists.newArrayList(
                new ProjectIterationId("PROJECT_SLUG", "ITERATION_SLUG",
                        ProjectType.File)
        );

        EmailBuilderStrategy strategy =
                new EmailServiceImpl.RequestToJoinVersionGroupEmailStrategy(
                        fromLoginName, fromName, replyEmail,
                        versionGroupName, versionGroupSlug,
                        projectIterIds, htmlMessage);

        builder.buildMessage(message, strategy, toAddresses,
                "requestToJoinVersionGroup test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(msgs.format(
                "jsf.email.JoinGroupRequest.Subject", versionGroupName));

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        assertThat(html).contains(msgs.format(
                "jsf.email.joingrouprequest.RequestingToJoinGroup",
                fromName, fromLoginName, versionGroupName));
        assertThat(html).contains(
                htmlMessage);
        assertThat(html).contains(
                serverPath + "/version-group/view/" + versionGroupSlug);
    }

    @Test
    public void usernameChanged() throws Exception {
        String newUsername = "NEW_USERNAME[测试]";

        EmailBuilderStrategy strategy =
                new UserAction.UsernameChangedEmailStrategy(newUsername, true);

        builder.buildMessage(message, strategy, toAddresses,
                "usernameChanged test");

        checkFromAndTo(message);
        assertThat(message.getSubject()).isEqualTo(msgs.get(
                "jsf.email.usernamechange.Subject"));

        String html = extractHtmlPart(message);
        checkGenericTemplate(html);

        assertThat(html).contains(msgs.format(
                "jsf.email.usernamechange.YourNewUsername", newUsername));
        assertThat(html).contains(
                serverPath + "/account/password_reset_request");
    }

}
