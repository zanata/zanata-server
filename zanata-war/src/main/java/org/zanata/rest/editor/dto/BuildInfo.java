/*
 * Copyright 2016, Red Hat, Inc. and individual contributors as indicated by the
 * @author tags. See the copyright.txt file in the distribution for a full
 * listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */

package org.zanata.rest.editor.dto;


import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonPropertyOrder;
import org.codehaus.jackson.map.annotate.JsonSerialize;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
@JsonPropertyOrder({ "version", "buildTimestamp", "scmDescribe", "copyrightNotice" })
public class BuildInfo extends JsonObject {

    private final String version;
    private final String buildTimestamp;
    private final String scmDescribe;
    private final String copyrightNotice;

    public BuildInfo(String version, String buildTimestamp,
            String scmDescribe, String copyrightNotice) {
        this.version = version;
        this.buildTimestamp = buildTimestamp;
        this.scmDescribe = scmDescribe;
        this.copyrightNotice = copyrightNotice;
    }

    public String getVersion() {
        return version;
    }

    public String getBuildTimestamp() {
        return buildTimestamp;
    }

    public String getScmDescribe() {
        return scmDescribe;
    }

    public String getCopyrightNotice() {
        return copyrightNotice;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        BuildInfo buildInfo = (BuildInfo) o;

        if (version != null ? !version.equals(buildInfo.version) :
            buildInfo.version != null) return false;
        if (buildTimestamp != null ?
            !buildTimestamp.equals(buildInfo.buildTimestamp) :
            buildInfo.buildTimestamp != null) return false;
        if (scmDescribe != null ? !scmDescribe.equals(buildInfo.scmDescribe) :
            buildInfo.scmDescribe != null) return false;
        return !(copyrightNotice != null ?
            !copyrightNotice.equals(buildInfo.copyrightNotice) :
            buildInfo.copyrightNotice != null);

    }

    @Override
    public int hashCode() {
        int result = version != null ? version.hashCode() : 0;
        result =
            31 * result +
                (buildTimestamp != null ? buildTimestamp.hashCode() : 0);
        result =
            31 * result + (scmDescribe != null ? scmDescribe.hashCode() : 0);
        result = 31 * result +
            (copyrightNotice != null ? copyrightNotice.hashCode() : 0);
        return result;
    }
}
