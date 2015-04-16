/*
 * Copyright 2015, Red Hat, Inc. and individual contributors as indicated by the
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

package org.zanata;

import com.google.common.base.MoreObjects;
import org.apache.commons.lang.StringUtils;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.AutoCreate;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.zanata.config.JndiBackedConfig;

import javax.faces.application.ResourceHandler;
import javax.faces.context.FacesContext;
import java.util.AbstractMap;
import java.util.Set;

/**
 * Utility component for accessing zanata-assets resources from JSF/HTML page.
 *
 * Usage in JSF/HTML page: <link rel="shortcut icon" href="#{assets['img/logo/logo.ico']}"/>
 * Rendered URL from example above is: {@link #DEFAULT_WEB_ASSETS_URL}/img/logo/logo.ico
 *
 * {@link #DEFAULT_WEB_ASSETS_URL} can be overridden in JBoss standalone.xml
 *
 *  <subsystem xmlns="urn:jboss:domain:naming:1.4">
 *      <bindings>
 *       ...
 *          <simple name="java:global/zanata/webassets/url-base" value="http://localhost:8080/testassets"/>
 *      </bindings>
 *  </subsystem>
 *
 *
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@AutoCreate
@Name("assets")
@Scope(ScopeType.APPLICATION)
public class WebAssetsConfiguration extends AbstractMap<String, String> {
    @In
    private JndiBackedConfig jndiBackedConfig;

    /**
     *  Default url for webassets, http://{zanata.url}/javax.faces.resource/jars/assets
     */
    private final static String DEFAULT_WEB_ASSETS_URL = String.format("%s%s/%s/%s",
            FacesContext.getCurrentInstance().getExternalContext()
                    .getRequestContextPath(),
            ResourceHandler.RESOURCE_IDENTIFIER, "jars", "assets");

    private String webAssetsUrlBase;

    private String getWebAssetsUrl(String resource) {
        return String.format("%s/%s", getWebAssetsUrlBase(), resource);
    }

    /**
     * Try to get from jndiBackedConfig bean
     * (java:global/zanata/webassets/url-base) if exist, else return
     * DEFAULT_WEB_ASSETS_URL
     */
    private String getWebAssetsUrlBase() {
        if (StringUtils.isBlank(webAssetsUrlBase)) {
            webAssetsUrlBase = MoreObjects.firstNonNull(
                jndiBackedConfig.getWebAssetsUrlBase(), DEFAULT_WEB_ASSETS_URL);
        }
        return webAssetsUrlBase;
    }
    
    @Override
    public String get(Object key) {
        return getWebAssetsUrl((String)key);
    }

    @Override
    public Set<Entry<String, String>> entrySet() {
        return null;
    }
}
