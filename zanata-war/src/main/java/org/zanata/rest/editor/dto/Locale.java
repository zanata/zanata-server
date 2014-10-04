package org.zanata.rest.editor.dto;

import java.io.Serializable;import java.lang.String;

import javax.validation.constraints.NotNull;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonPropertyOrder;
import org.codehaus.jackson.map.annotate.JsonSerialize;
import org.hibernate.validator.constraints.Email;
import org.hibernate.validator.constraints.NotEmpty;
import org.zanata.common.LocaleId;
import org.zanata.common.Namespaces;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonPropertyOrder({ "localeId", "name"})
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
public class Locale implements Serializable {

    private LocaleId localeId;
    private String name;

    public Locale(LocaleId localeId, String name) {
        this.localeId = localeId;
        this.name = name;
    }

    @NotNull
    public LocaleId getLocaleId() {
        return localeId;
    }

    public void setLocaleId(LocaleId localeId) {
        this.localeId = localeId;
    }


    @NotNull
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
