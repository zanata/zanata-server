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

package org.zanata.action;

import com.google.common.base.Throwables;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.beanutils.BeanUtils;
import org.infinispan.manager.EmbeddedCacheManager;
import org.infinispan.stats.Stats;
import org.zanata.i18n.Messages;
import org.zanata.util.Zanata;
import javax.faces.bean.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.io.Serializable;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;

/**
 * @author Armagan Ersoz <a href="mailto:aersoz@redhat.com">aersoz@redhat.com</a>
 */
@Named("cacheAction")
@ViewScoped
@Slf4j
public class CacheAction implements Serializable {

    @Inject
    @Zanata
    private EmbeddedCacheManager cacheManager;

    @Inject
    private Messages msgs;

    public CacheAction() {
    }

    public Stats getStats(String cacheName) {
        return cacheManager.getCache(cacheName).getAdvancedCache().getStats();
    }

    public ArrayList<String> getCacheList() {
        ArrayList<String> cacheNames = new ArrayList<>(cacheManager.getCacheNames());
        Collections.sort(cacheNames);
        return cacheNames;
    }

    public void clearCache(String cacheName) {
        cacheManager.getCache(cacheName).clear();
        getStats(cacheName).reset();
    }

    public void clearAllCaches(){
        cacheManager.getCacheNames().forEach(this::clearCache);
    }

    /*@Return the entire set of properties for which the specified bean provides a read method.
    * In this case, the bean is a stats object. The returning value is the set of StatsImpl
    * (org.infinispan.stats.impl) class's properties. This returning value is used for
    * composing the cache statistics table at the admin site. */

    public Map<String, String> getPropertyNamesAndValues(String cacheName) {
          try {
              Map<String, String> properties =
                  BeanUtils.describe(getStats(cacheName));
              properties.remove("class");
              return properties;
          } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
              throw Throwables.propagate(e);
          }
    }

    public String getNameOfProperty(String key) {
        return msgs.get("jsf.cacheStats." + key + ".name");
    }

    public String getDescOfProperty(String key) {
        return msgs.get("jsf.cacheStats." + key + ".description");
    }
}
