package org.zanata.action;

import java.io.Serializable;

import javax.mail.internet.InternetAddress;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import com.googlecode.totallylazy.collections.PersistentMap;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.hibernate.validator.constraints.NotEmpty;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.End;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.faces.FacesMessages;
import org.jboss.seam.faces.Renderer;
import org.zanata.dao.AccountDAO;
import org.zanata.email.EmailBuilder;
import org.zanata.email.EmailBuilderStrategy;
import org.zanata.i18n.Messages;
import org.zanata.model.HAccount;
import org.zanata.model.HAccountResetPasswordKey;
import org.zanata.service.UserAccountService;

import static org.zanata.email.EmailUtil.toAddress;

@Name("passwordResetRequest")
@NoArgsConstructor
@Scope(ScopeType.EVENT)
@Slf4j
public class PasswordResetRequestAction implements Serializable {
    private static final long serialVersionUID = 1L;

    @In
    private AccountDAO accountDAO;
    @In
    private EmailBuilder.Context emailContext;
    @In
    private UserAccountService userAccountServiceImpl;

    private String username;
    private String email;
    private String activationKey;

    private HAccount account;

    public HAccount getAccount() {
        return account;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @NotEmpty
    @Size(min = 3, max = 20)
    @Pattern(regexp = "^[a-z\\d_]{3,20}$")
    public String getUsername() {
        return username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @org.hibernate.validator.constraints.Email
    @NotEmpty
    public String getEmail() {
        return email;
    }

    @End
    public String requestReset() {
        account = accountDAO.getByUsernameAndEmail(username, email);
        HAccountResetPasswordKey key =
                userAccountServiceImpl.requestPasswordReset(account);

        if (key == null) {
            FacesMessages.instance().add("No such account found");
            return null;
        } else {
            try {
                EmailBuilder builder = new EmailBuilder(emailContext);
                builder.sendMessage(new PasswordResetEmailStrategy(
                        key.getKeyHash()),
                        toAddress(account.getPerson()), null);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            log.info("Sent password reset key to {} ({})", account
                    .getPerson().getName(), account.getUsername());
            FacesMessages
                    .instance()
                    .add("You will soon receive an email with a link to reset your password.");
            return "/home.xhtml";
        }

    }

    public String getActivationKey() {
        return activationKey;
    }

    public void setActivationKey(String activationKey) {
        this.activationKey = activationKey;
    }

    @RequiredArgsConstructor
    public static class PasswordResetEmailStrategy extends
            EmailBuilderStrategy {
        private final String key;

        @Override
        public String getSubject(Messages msgs) {
            return msgs.get("jsf.email.passwordreset.Subject");
        }

        @Override
        public String getBodyResourceName() {
            return "org/zanata/email/templates/password_reset.vm";
        }

        @Override
        public PersistentMap<String, Object> makeContext(
                PersistentMap<String, Object> genericContext,
                InternetAddress[] toAddresses) {
            PersistentMap<String, Object> context = super.makeContext(genericContext,
                    toAddresses);
            return context
                    .insert("activationKey", key)
                    .insert("toName", toAddresses[0].getPersonal());
        }
    }
}
