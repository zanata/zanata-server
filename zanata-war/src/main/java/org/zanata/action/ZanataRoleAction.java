package org.zanata.action;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.jboss.seam.annotations.Begin;
import org.jboss.seam.annotations.Create;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Install;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.core.Conversation;
import org.zanata.security.ZanataIdentity;
import org.zanata.seam.security.ZanataJpaIdentityStore;
import org.zanata.security.annotations.CheckLoggedIn;
import org.zanata.security.annotations.CheckRole;
import org.zanata.security.annotations.ZanataSecured;

import static org.jboss.seam.ScopeType.CONVERSATION;
import static org.jboss.seam.annotations.Install.APPLICATION;

/**
 * @author Patrick Huang
 *         <a href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@Name("zanataRoleAction")
@Scope(CONVERSATION)
@Install(precedence = APPLICATION)
@ZanataSecured
@CheckLoggedIn
@CheckRole("admin")
public class ZanataRoleAction implements Serializable {
    private static final long serialVersionUID = -3830647911484729768L;
    private String originalRole;
    private String role;
    private List<String> groups;

    @In
    ZanataJpaIdentityStore identityStore;

    @In
    ZanataIdentity identity;

    @Create
    public void onCreate() {
        identity.checkPermission("seam.role", "read");
    }

    @Begin
    public void createRole() {
        groups = new ArrayList<>();
    }

    @Begin
    public void editRole(String role) {
        this.originalRole = role;
        this.role = role;
        groups = identityStore.getRoleGroups(role);
    }

    public String save() {
        if (role != null && originalRole != null &&
                !role.equals(originalRole)) {
            identityStore.deleteRole(originalRole);
        }

        if (identityStore.roleExists(role)) {
            return saveExistingRole();
        } else {
            return saveNewRole();
        }
    }

    private String saveNewRole() {
        boolean success = identityStore.createRole(role);

        if (success) {
            for (String r : groups) {
                identityStore.addRoleToGroup(role, r);
            }

            Conversation.instance().end();
        }

        return "success";
    }

    private String saveExistingRole() {
        List<String> grantedRoles = identityStore.getRoleGroups(role);

        if (grantedRoles != null) {
            for (String r : grantedRoles) {
                if (!groups.contains(r)) {
                    identityStore.removeRoleFromGroup(role, r);
                }
            }
        }

        for (String r : groups) {
            if (grantedRoles == null || !grantedRoles.contains(r)) {
                identityStore.addRoleToGroup(role, r);
            }
        }

        Conversation.instance().end();
        return "success";
    }

    public String getRole() {
        return role;
    }

    public List<String> getAssignableRoles() {
        List<String> roles = identityStore.listGrantableRoles();
        roles.remove(role);
        return roles;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getGroups() {
        return groups;
    }

    public void setGroups(List<String> groups) {
        this.groups = groups;
    }
}
