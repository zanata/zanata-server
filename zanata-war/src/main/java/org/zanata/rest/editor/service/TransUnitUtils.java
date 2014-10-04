package org.zanata.rest.editor.service;

import java.util.List;

import com.google.common.base.Optional;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang.StringUtils;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.common.LocaleId;
import org.zanata.model.HTextFlow;
import org.zanata.model.HTextFlowTarget;
import org.zanata.rest.editor.dto.TransUnit;
import org.zanata.rest.editor.dto.TextFlow;
import org.zanata.rest.dto.resource.TextFlowTarget;
import org.zanata.rest.service.ResourceUtils;

import com.google.common.collect.Lists;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Name("transUnitUtils")
@Scope(ScopeType.STATELESS)
@Slf4j
@AutoCreate
public class TransUnitUtils {
    public static int MAX_SIZE = 200;
    public static String ID_SEPARATOR = ",";

    @In
    private ResourceUtils resourceUtils;

    /**
     * Filter out non-numeric id and convert from String to Long.
     *
     * @param idsString
     */
    public static List<Long> filterAndConvertIdsToList(String idsString) {
        List<String> ids = Lists.newArrayList(idsString.split(ID_SEPARATOR));
        List<Long> idList = Lists.newArrayList();
        for (String id : ids) {
            if (StringUtils.isNumeric(id)) {
                idList.add(Long.parseLong(id));
            }
        }
        return idList;
    }

    public TransUnit buildTransUnit(HTextFlowTarget hTarget,
            LocaleId localeId, boolean includeTf, boolean includeTft) {
        TransUnit tu = new TransUnit();
        HTextFlow htf = hTarget.getTextFlow();

        if (includeTf) {
            tu = buildTransUnit(htf, localeId);
        }

        if (includeTft) {
            TextFlowTarget target = new TextFlowTarget(htf.getResId());
            resourceUtils.transferToTextFlowTarget(hTarget, target,
                Optional.of("Editor"));
            tu.put(localeId.toString(), target);
        }
        return tu;
    }

    public TransUnit buildTransUnit(HTextFlow hTextFlow, LocaleId localeId) {
        TransUnit tu = new TransUnit();

        TextFlow tf = new TextFlow(hTextFlow.getResId(), localeId);
        transferToTextFlow(hTextFlow, tf);
        tu.put(TransUnit.SOURCE, tf);

        return tu;
    }

    public void transferToTextFlow(HTextFlow from, TextFlow to) {
        resourceUtils.transferToTextFlow(from, to);
        to.setWordCount(from.getWordCount().intValue());
    }
}
