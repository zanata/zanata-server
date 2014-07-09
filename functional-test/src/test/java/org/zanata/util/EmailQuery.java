package org.zanata.util;

import org.subethamail.wiser.WiserMessage;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Damian Jansen <a href="mailto:djansen@redhat.com">djansen@redhat.com</a>
 */
public class EmailQuery {

    private static Pattern activationLink = Pattern
            .compile("<(http://.+/activate/.+)>");
    private static Pattern validateLink = Pattern
            .compile("<(http://.+/validate_email/.+)>");

    public static boolean hasActivationLink(WiserMessage emailMessage) {
        Matcher matcher = activationLink.matcher(HasEmailRule.getEmailContent(emailMessage));
        return matcher.find();
    }

    public static String getActivationLink(WiserMessage emailMessage) {
        Matcher matcher = activationLink.matcher(HasEmailRule.getEmailContent(emailMessage));
        assert(matcher.find());
        return matcher.group(1);
    }

    public static boolean hasEmailVerificationLink(WiserMessage emailMessage) {
        Matcher matcher = validateLink.matcher(HasEmailRule.getEmailContent(emailMessage));
        return matcher.find();
    }

    public static String getEmailVerificationLink(WiserMessage emailMessage) {
        Matcher matcher = validateLink.matcher(HasEmailRule.getEmailContent(emailMessage));
        assert(matcher.find());
        return matcher.group(1);
    }
}
