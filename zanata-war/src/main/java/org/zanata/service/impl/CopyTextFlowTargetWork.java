package org.zanata.service.impl;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.util.Work;
import org.zanata.dao.TextFlowDAO;
import org.zanata.dao.TextFlowTargetDAO;
import org.zanata.model.HTextFlow;
import org.zanata.model.HTextFlowTarget;
import org.zanata.service.CopyVersionService;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Slf4j
@AllArgsConstructor
public class CopyTextFlowTargetWork extends Work<Integer> {
    private final Long tfId;
    private final Long newTfId;
    private final TextFlowTargetDAO textFlowTargetDAO;
    private final TextFlowDAO textFlowDAO;
    private final CopyVersionService copyVersionService;
    private final int batchStart;
    private final int batchLength;

    @Override
    protected Integer work() throws Exception {
        HTextFlow newTextFlow = textFlowDAO.findById(newTfId);

        List<HTextFlowTarget> copyTargets =
                textFlowTargetDAO
                        .getByTextFlowId(tfId, batchStart, batchLength);

        for (HTextFlowTarget tft : copyTargets) {
            HTextFlowTarget newTextFlowTarget =
                    copyVersionService.copyTextFlowTarget(newTextFlow, tft);

            newTextFlow.getTargets()
                    .put(newTextFlowTarget.getLocale().getId(),
                            newTextFlowTarget);
        }
        textFlowDAO.makePersistent(newTextFlow);
        textFlowDAO.flush();
        return copyTargets.size();
    }
}
