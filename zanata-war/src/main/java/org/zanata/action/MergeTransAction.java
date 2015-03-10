package org.zanata.action;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import org.apache.commons.lang.StringUtils;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.faces.FacesMessages;
import org.jboss.seam.international.StatusMessage;
import org.zanata.dao.ProjectDAO;
import org.zanata.dao.ProjectIterationDAO;
import org.zanata.model.HProject;
import org.zanata.model.HProjectIteration;

import lombok.Getter;
import lombok.Setter;

/**
 * Handles action from merge_trans_modal.xhtml
 * 
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("mergeTransAction")
@Scope(ScopeType.PAGE)
public class MergeTransAction implements Serializable {

    @Getter
    @Setter
    private String targetProjectSlug;

    @Getter
    @Setter
    private String targetVersionSlug;

    @Getter
    private String sourceProjectSlug;

    @Getter
    @Setter
    private String sourceVersionSlug;

    @Getter
    @Setter
    private boolean keepExistingTranslation;

    @In
    private ProjectDAO projectDAO;
    
    @In
    private ProjectIterationDAO projectIterationDAO;
    
    @In
    private MergeTranslationsManager mergeTranslationsManager;

    @In
    private CopyTransManager copyTransManager;

    @In
    private CopyVersionManager copyVersionManager;
    
    private HProjectIteration targetVersion;

    private HProject sourceProject;

    public void setSourceProjectSlug(String sourceProjectSlug) {
        sourceProject = null;
        sourceVersionSlug = null;
        this.sourceProjectSlug = sourceProjectSlug;
    }

    public HProjectIteration getTargetVersion() {
        if(targetVersion == null) {
            targetVersion =
                    projectIterationDAO.getBySlug(targetProjectSlug,
                            targetVersionSlug);
        }
        return targetVersion;
    }

    public HProject getSourceProject() {
        if(sourceProject == null) {
            sourceProject = projectDAO.getBySlug(sourceProjectSlug);
        }
        return sourceProject;
    }

    public List<HProjectIteration> getSourceVersions() {
        List<HProjectIteration> versions =
                getSourceProject().getProjectIterations();
        
        //remove target version if both are the same project
        if (sourceProjectSlug.equals(targetProjectSlug)) {
            for (HProjectIteration version : versions) {
                if (version.getSlug().equals(targetVersionSlug)) {
                    versions.remove(version);
                    break;
                }
            }
        }
        return versions;
    }
    
    public void startMergeTranslations() {
        if (isCopyActionsRunning()) {
            FacesMessages.instance().add(StatusMessage.Severity.WARN,
                    "Another copy process is in progress for this version. " +
                            "Please try again after it is completed.");
            return;
        }
        mergeTranslationsManager.startMergeTranslations(sourceProjectSlug,
                sourceVersionSlug, targetProjectSlug, targetVersionSlug,
                !keepExistingTranslation);
    }
    
    // Check if copy-trans, copy version or merge-trans is running for given
    // version
    public boolean isCopyActionsRunning() {
        return mergeTranslationsManager.isMergeTranslationsRunning(
                targetProjectSlug,
                targetVersionSlug)
                || copyVersionManager.isCopyVersionRunning(targetProjectSlug,
                        targetVersionSlug) ||
                copyTransManager.isCopyTransRunning(getTargetVersion());
    }
}
