package org.zanata.webtrans.server.rpc;

import net.customware.gwt.dispatch.server.ExecutionContext;
import net.customware.gwt.dispatch.shared.ActionException;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.dao.GlossaryDAO;
import org.zanata.model.HGlossaryEntry;
import org.zanata.model.HGlossaryTerm;
import org.zanata.model.HLocale;
import org.zanata.security.ZanataIdentity;
import org.zanata.service.LocaleService;
import org.zanata.webtrans.server.ActionHandlerFor;
import org.zanata.webtrans.shared.model.GlossaryDetails;
import org.zanata.webtrans.shared.rpc.UpdateGlossaryTermAction;
import org.zanata.webtrans.shared.rpc.UpdateGlossaryTermResult;

@Name("webtrans.gwt.UpdateGlossaryTermHandler")
@Scope(ScopeType.STATELESS)
@ActionHandlerFor(UpdateGlossaryTermAction.class)
public class UpdateGlossaryTermHandler
        extends
        AbstractActionHandler<UpdateGlossaryTermAction, UpdateGlossaryTermResult> {
    @In
    private ZanataIdentity identity;

    @In
    private GlossaryDAO glossaryDAO;

    @In
    private LocaleService localeServiceImpl;

    @Override
    public UpdateGlossaryTermResult execute(UpdateGlossaryTermAction action,
            ExecutionContext context) throws ActionException {
        identity.hasPermission("glossary-update", "");

        GlossaryDetails selectedDetailEntry = action.getSelectedDetailEntry();

        String resId = selectedDetailEntry.getResId();

        HGlossaryEntry entry =
                glossaryDAO.getEntryByResIdAndLocale(resId,
                    selectedDetailEntry.getSrcLocale());

        HLocale targetLocale =
                localeServiceImpl.getByLocaleId(selectedDetailEntry
                        .getTargetLocale());

        HGlossaryTerm targetTerm = entry.getGlossaryTerms().get(targetLocale);
        if (targetTerm == null) {
            throw new ActionException(
                    "Update failed for glossary term with source content: "
                            + selectedDetailEntry.getSrcLocale()
                            + " and target locale: "
                            + selectedDetailEntry.getTargetLocale());
        } else if (selectedDetailEntry.getTargetVersionNum().compareTo(
                targetTerm.getVersionNum()) != 0) {
            throw new ActionException("Update failed for glossary term "
                    + selectedDetailEntry.getTarget() + " base versionNum "
                    + selectedDetailEntry.getTargetVersionNum()
                    + " does not match current versionNum "
                    + targetTerm.getVersionNum());
        } else {
            targetTerm.setContent(action.getNewTargetTerm());
            targetTerm.setComment(action.getNewTargetComment());
            entry.setPos(action.getNewPos());
            entry.setDescription(action.getNewDescription());

            HGlossaryEntry entryResult = glossaryDAO.makePersistent(entry);
            glossaryDAO.flush();

            HGlossaryTerm srcTerm =
                    entryResult.getGlossaryTerms().get(
                            entryResult.getSrcLocale());

            GlossaryDetails details =
                    new GlossaryDetails(entryResult.getResId(),
                            srcTerm.getContent(),
                            targetTerm.getContent(),
                            entryResult.getDescription(),
                            entryResult.getPos(),
                            targetTerm.getComment(),
                            entryResult.getSourceRef(),
                            selectedDetailEntry.getSrcLocale(),
                            selectedDetailEntry.getTargetLocale(),
                            targetTerm.getVersionNum(),
                            targetTerm.getLastChanged());

            return new UpdateGlossaryTermResult(details);
        }
    }

    @Override
    public void rollback(UpdateGlossaryTermAction action,
            UpdateGlossaryTermResult result, ExecutionContext context)
            throws ActionException {
    }

}
