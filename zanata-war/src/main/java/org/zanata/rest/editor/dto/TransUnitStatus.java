package org.zanata.rest.editor.dto;

import java.io.Serializable;import java.lang.Long;import java.lang.String;

import javax.validation.constraints.NotNull;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonPropertyOrder;
import org.codehaus.jackson.map.annotate.JsonSerialize;
import org.zanata.common.ContentState;
import org.zanata.common.LocaleId;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonPropertyOrder({ "id", "resId", "status"})
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
public class TransUnitStatus implements Serializable {

    private Long id;
    private String resId;
    private ContentState status;

    public TransUnitStatus(Long id, String resId, ContentState status) {
        this.id = id;
        this.resId = resId;
        this.status = status;
    }

    @NotNull
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @NotNull
    public String getResId() {
        return resId;
    }

    public void setResId(String resId) {
        this.resId = resId;
    }

    @NotNull
    public ContentState getStatus() {
        return status;
    }

    public void setStatus(ContentState status) {
        this.status = status;
    }
}
