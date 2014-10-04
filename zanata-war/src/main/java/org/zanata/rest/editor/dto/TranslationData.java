package org.zanata.rest.editor.dto;

import java.io.Serializable;
import java.util.Collections;
import java.util.List;

import javax.validation.constraints.NotNull;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonProperty;
import org.codehaus.jackson.annotate.JsonPropertyOrder;
import org.codehaus.jackson.map.annotate.JsonSerialize;
import org.zanata.common.ContentState;

import com.google.common.collect.Lists;

/**
 * Class for information on translation updates requested from client and
 * response from server.
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@JsonPropertyOrder({ "id", "revision", "status", "content", "contents", "plural" })
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
public class TranslationData implements Serializable {

    @NotNull
    private Integer id;

    @NotNull
    private Integer revision;

    @JsonProperty("content")
    private String content;

    @JsonProperty("contents")
    private List<String> contents;

    @NotNull
    private ContentState status = ContentState.New;

    private boolean plural;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getRevision() {
        return revision;
    }

    public void setRevision(Integer revision) {
        this.revision = revision;
    }

    public ContentState getStatus() {
        return status;
    }

    public void setStatus(ContentState status) {
        this.status = status;
    }

    public boolean isPlural() {
        return plural;
    }

    public void setPlural(boolean plural) {
        this.plural = plural;
    }

    @JsonIgnore
    public List<String> getContents() {
        if (content != null) {
            return Lists.newArrayList(content);
        } else if (contents != null) {
            return contents;
        } else {
            return Collections.emptyList();
        }
    }

    @JsonIgnore
    public void setContents(String... contents) {
        setContents(Lists.newArrayList(contents));
    }

    @JsonIgnore
    public void setContents(List<String> contents) {
        if (contents == null) {
            this.content = null;
            this.contents = null;
            return;
        }

        switch (contents.size()) {
            case 0:
                this.content = null;
                this.contents = null;
                break;
            case 1:
                this.content = contents.get(0);
                this.contents = null;
                break;
            default:
                this.content = null;
                this.contents = contents;
        }
    }
}
