package org.zanata.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.Create;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Observer;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.annotations.Startup;
import org.zanata.common.ContentState;
import org.zanata.common.LocaleId;
import org.zanata.dao.TextFlowDAO;
import org.zanata.model.HTextFlowTarget;
import org.zanata.service.TranslatedIdService;

@Name("translatedIdService")
@Startup
@Scope(ScopeType.APPLICATION)
@Slf4j
public class TranslatedIdServiceImpl implements TranslatedIdService
{
   // Note: also want info on how long ago each locale list was added to the cache
   // could add this later in a separate map.
   private Map<LocaleId, List<Long>> cache;

   @In
   private TextFlowDAO textFlowDAO;

   @Create
   public void create()
   {
      cache = new HashMap<LocaleId, List<Long>>();
   }

   @Override
   public List<Long> getIdsWithTranslations(LocaleId locale)
   {
      List<Long> ids = cache.get(locale);
      if (ids == null)
      {
         ids = textFlowDAO.findIdsWithTranslations(locale);
         cache.put(locale, ids);
      }
      return ids;
   }

   @Override
   @Observer("targetChanged")
   public void updateCache(HTextFlowTarget target)
   {
      log.info("Target updated: {}", target);
      List<Long> ids = cache.get(target.getLocale().getLocaleId());

      if (ids == null)
      {
         log.info("ids null for locale {}" + target.getLocale().getLocaleId().getId());
      }
      else
      {
         Long id = target.getId();
         log.info("target id {}", id);
         log.info("ids length before: {}", ids.size());
         if (target.getState() == ContentState.Approved)
         {
            if (!ids.contains(id))
            {
               ids.add(id);
            }
         }
         else
         {
            ids.remove(id);
         }
         log.info("ids length after: {}", ids.size());
      }
   }

}
