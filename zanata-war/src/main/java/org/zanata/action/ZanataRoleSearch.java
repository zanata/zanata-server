package org.zanata.action;

import java.io.Serializable;
import java.util.List;

import org.jboss.seam.annotations.Create;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Install;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.annotations.datamodel.DataModel;
import org.jboss.seam.annotations.datamodel.DataModelSelection;
import org.zanata.security.ZanataIdentity;
import org.zanata.seam.security.ZanataJpaIdentityStore;

import static org.jboss.seam.ScopeType.SESSION;
import static org.jboss.seam.annotations.Install.APPLICATION;

/**
 * @author Patrick Huang
 *         <a href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@Name("zanataRoleSearch")
@Scope(SESSION)
@Install(precedence = APPLICATION)
public class ZanataRoleSearch implements Serializable {
    private static final long serialVersionUID = 1734703030195353735L;
    @DataModel
    List<String> roles;

    @DataModelSelection
    String selectedRole;

    @In
    ZanataJpaIdentityStore identityStore;

    @In
    private ZanataIdentity identity;

    @Create
    public void onCreate() {
        identity.checkPermission("seam.role", "read");
    }

    public void loadRoles() {
        roles = identityStore.listRoles();
    }

    public String getRoleGroups(String role) {
        List<String> roles = identityStore.getRoleGroups(role);

        if (roles == null) return "";

        StringBuilder sb = new StringBuilder();

        for (String r : roles) {
            sb.append((sb.length() > 0 ? ", " : "") + r);
        }

        return sb.toString();
    }

    public String getSelectedRole() {
        return selectedRole;
    }
}
