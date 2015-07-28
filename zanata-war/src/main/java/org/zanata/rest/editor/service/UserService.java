package org.zanata.rest.editor.service;

import java.util.Set;
import javax.annotation.Nullable;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Transactional;
import org.jboss.seam.security.management.JpaIdentityStore;
import org.zanata.dao.AccountDAO;
import org.zanata.model.HAccount;
import org.zanata.model.HLocale;
import org.zanata.model.HPerson;
import org.zanata.rest.editor.dto.User;
import org.zanata.rest.editor.service.resource.UserResource;
import org.zanata.service.GravatarService;

import com.google.common.base.Function;
import com.google.common.base.Joiner;
import com.google.common.collect.Collections2;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("editor.userService")
@Path(UserResource.SERVICE_PATH)
@Transactional
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class UserService implements UserResource {

    @In(value = JpaIdentityStore.AUTHENTICATED_USER)
    private HAccount authenticatedAccount;

    @In
    private GravatarService gravatarServiceImpl;

    @In
    private AccountDAO accountDAO;

    @Override
    public Response getMyInfo() {
        return createUser(authenticatedAccount);
    }

    @Override
    public Response getUserInfo(String username) {
        HAccount account = accountDAO.getByUsername(username);
        return createUser(account);
    }

    private Response createUser(HAccount account) {
        if (account == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        HPerson person = account.getPerson();
        String email = person.getEmail();

        User user =
                new User(account.getUsername(), email, person.getName(),
                        gravatarServiceImpl.getGravatarHash(email),
                        gravatarServiceImpl.getUserImageUrl(
                                GravatarService.USER_IMAGE_SIZE, email),
                        getUserLanguageTeams(person));
        return Response.ok(user).build();
    }

    private String getUserLanguageTeams(HPerson person) {
        Set<HLocale> languageMemberships = person.getLanguageMemberships();

        return Joiner.on(", ").skipNulls().join(
                Collections2.transform(languageMemberships, languageNameFn));
    }
    
    private final Function<HLocale, String> languageNameFn =
            new Function<HLocale, String>() {
                @Override
                public String apply(HLocale locale) {
                    return locale.retrieveDisplayName();
                }
            };
}
