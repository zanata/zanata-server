package org.zanata.service;

import java.util.List;

import org.zanata.common.LocaleId;
import org.zanata.model.HTextFlowTarget;

public interface TranslatedIdService
{
   /**
    * @param locale
    * @return a list of all text flow ids that have approved translations for given a locale
    */
   List<Long> getIdsWithTranslations(LocaleId locale);

   /**
    * Update the cached list of ids to reflect the state of the given target.
    * 
    * This ensures that if the target state is Approved, it is included in the list, otherwise it is not included in the list.
    */
   void updateCache(HTextFlowTarget target);
}
