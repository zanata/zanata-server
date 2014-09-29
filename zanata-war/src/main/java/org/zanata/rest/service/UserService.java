package org.zanata.rest.service;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;

import org.jboss.resteasy.util.GenericType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.security.management.JpaIdentityStore;
import org.zanata.dao.AccountDAO;
import org.zanata.model.HAccount;
import org.zanata.model.HPerson;
import org.zanata.rest.dto.Locale;
import org.zanata.rest.dto.TransUnitStatus;
import org.zanata.rest.dto.User;
import org.zanata.rest.dto.VersionInfo;
import org.zanata.service.GravatarService;
import org.zanata.util.VersionUtility;

import org.zanata.rest.service.UserResource;

import java.lang.reflect.Type;
import java.util.List;

@Name("userService")
@Path(UserResource.SERVICE_PATH)
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
        User user =
            new User(account.getUsername(), person.getEmail(),
                person.getName(),
                gravatarServiceImpl.getGravatarHash(person.getEmail()));
        return Response.ok(user).build();
    }
}
