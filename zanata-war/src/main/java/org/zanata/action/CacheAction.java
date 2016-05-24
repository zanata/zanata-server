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

import org.infinispan.Cache;
import org.infinispan.manager.CacheContainer;
import org.infinispan.stats.Stats;
import org.zanata.service.impl.TranslationStateCacheImpl;
import org.zanata.service.impl.VersionStateCacheImpl;
import org.zanata.util.Zanata;
import javax.inject.Inject;
import javax.inject.Named;
import java.io.Serializable;
import java.lang.reflect.Method;
import java.util.List;


/**
 * @author Armagan Ersoz <a href="mailto:aersoz@redhat.com">aersoz@redhat.com</a>
 */
@Named("cacheAction")
@javax.faces.bean.ViewScoped
public class CacheAction implements Serializable {

    private static final String[] cacheNames =
        { TranslationStateCacheImpl.DOC_STATISTIC_CACHE_NAME,
            TranslationStateCacheImpl.DOC_STATUS_CACHE_NAME,
            TranslationStateCacheImpl.TFT_VALIDATION_CACHE_NAME,
            VersionStateCacheImpl.VERSION_STATISTIC_CACHE_NAME};

    @Inject
    private TranslationStateCacheImpl translationStateCacheImpl;

    @Inject
    @Zanata
    private CacheContainer cacheContainer;

    public CacheAction() {
    }

    public List<String> getCacheList(){
        return translationStateCacheImpl.getCacheList(cacheNames);
    }

    public Stats getStats(String cacheName) {
        return translationStateCacheImpl.getStats(cacheName);
    }

    public void clearCache(String cacheName){
        translationStateCacheImpl.clearCache(cacheName);
    }

    public void clearAllCaches(){
        translationStateCacheImpl.clearAllCaches(cacheNames);
    }

    public Method[] getMethodList(){
        return Stats.class.getMethods();
    }










}
