package org.zanata.webtrans.shared.model;

import java.util.Date;
import java.util.List;

import org.zanata.common.LocaleId;

import com.google.gwt.user.client.rpc.IsSerializable;

public class GlossaryDetails implements IsSerializable {
    private String resId;
    private String description;
    private String pos;
    private String targetComment;
    private String sourceRef;
    private LocaleId srcLocale;
    private LocaleId targetLocale;
    private Integer targetVersionNum;
    private String source;
    private String target;
    private Date lastModifiedDate;

    @SuppressWarnings("unused")
    private GlossaryDetails() {
        this(null, null, null, null, null, null, null, null, null, null, null);
    }

    public GlossaryDetails(String resId, String source, String target,
            String description, String pos, String targetComment,
            String sourceRef, LocaleId srcLocale, LocaleId targetLocale,
            Integer targetVersionNum, Date lastModifiedDate) {
        this.resId = resId;
        this.source = source;
        this.target = target;
        this.description = description;
        this.pos = pos;
        this.targetComment = targetComment;
        this.sourceRef = sourceRef;
        this.srcLocale = srcLocale;
        this.targetLocale = targetLocale;
        this.targetVersionNum = targetVersionNum;
        this.lastModifiedDate = lastModifiedDate;
    }

    public String getResId() {
        return resId;
    }

    public String getDescription() {
        return description;
    }

    public String getPos() {
        return pos;
    }

    public String getTargetComment() {
        return targetComment;
    }

    public String getSourceRef() {
        return sourceRef;
    }

    public LocaleId getSrcLocale() {
        return srcLocale;
    }

    public LocaleId getTargetLocale() {
        return targetLocale;
    }

    public Integer getTargetVersionNum() {
        return targetVersionNum;
    }

    public String getSource() {
        return source;
    }

    public String getTarget() {
        return target;
    }

    public Date getLastModifiedDate() {
        return lastModifiedDate;
    }
}
