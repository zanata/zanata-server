/**
 * 
 */
package org.zanata.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Logger;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.log.Log;
import org.zanata.common.LocaleId;
import org.zanata.dao.DocumentDAO;
import org.zanata.dao.ProjectDAO;
import org.zanata.dao.ProjectIterationDAO;
import org.zanata.dao.TextFlowDAO;
import org.zanata.dao.TextFlowTargetDAO;
import org.zanata.model.HDocument;
import org.zanata.model.HProject;
import org.zanata.model.HProjectIteration;
import org.zanata.model.HTextFlow;
import org.zanata.model.HTextFlowTarget;
import org.zanata.service.TranslationStateCache;
import org.zanata.service.ValidationFactoryProvider;
import org.zanata.service.ValidationService;
import org.zanata.webtrans.server.rpc.TransUnitTransformer;
import org.zanata.webtrans.shared.model.DocumentStatus;
import org.zanata.webtrans.shared.model.ValidationAction;
import org.zanata.webtrans.shared.model.ValidationAction.State;
import org.zanata.webtrans.shared.model.ValidationId;
import org.zanata.webtrans.shared.validation.ValidationFactory;

import com.beust.jcommander.internal.Maps;
import com.google.common.base.Stopwatch;
import com.google.common.collect.Lists;

/**
 * 
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 * 
 */
@Name("validationServiceImpl")
@Scope(ScopeType.STATELESS)
public class ValidationServiceImpl implements ValidationService
{
   @Logger
   private Log log;

   @In
   private ProjectDAO projectDAO;

   @In
   private ProjectIterationDAO projectIterationDAO;

   @In
   private TextFlowTargetDAO textFlowTargetDAO;

   @In
   private DocumentDAO documentDAO;

   @In
   private TranslationStateCache translationStateCacheImpl;

   private ValidationFactory validationFactory;

   private ValidationFactory getValidationFactory()
   {
      if (validationFactory == null)
      {
         validationFactory = ValidationFactoryProvider.getFactoryInstance();
      }
      return validationFactory;
   }

   @Override
   public Collection<ValidationAction> getValidationAction(String projectSlug)
   {
      if (!StringUtils.isEmpty(projectSlug))
      {
         HProject project = projectDAO.getBySlug(projectSlug);
         return getValidationAction(project);
      }

      return Lists.newArrayList();
   }

   private Collection<ValidationAction> getValidationAction(HProject project, State... includeStates)
   {
      Map<String, String> customizedValidations = project.getCustomizedValidations();
      Collection<ValidationAction> mergedList = mergeCustomisedStateToAllValidations(customizedValidations);

      return filterList(mergedList, includeStates);
   }

   @Override
   public Collection<ValidationAction> getValidationAction(String projectSlug, String versionSlug)
   {
      if (!StringUtils.isEmpty(projectSlug) && !StringUtils.isEmpty(versionSlug))
      {
         HProjectIteration version = projectIterationDAO.getBySlug(projectSlug, versionSlug);
         return getValidationAction(version);
      }
      return Lists.newArrayList();
   }

   private Collection<ValidationAction> getValidationAction(HProjectIteration projectVersion, State... includeStates)
   {
      Map<String, String> customizedValidations = projectVersion.getCustomizedValidations();

      /**
       * Inherits validations from project if version has no defined validations
       */
      if (customizedValidations.isEmpty())
      {
         return getValidationAction(projectVersion.getProject());
      }

      Collection<ValidationAction> mergedList = mergeCustomisedStateToAllValidations(customizedValidations);

      return filterList(mergedList, includeStates);
   }

   private Collection<ValidationAction> filterList(Collection<ValidationAction> list, State... includeStates)
   {
      if (includeStates == null || includeStates.length == 0)
      {
         return list;
      }

      List<State> includeStateList = Arrays.asList(includeStates);

      Collection<ValidationAction> filteredList = Lists.newArrayList();
      for (ValidationAction action : list)
      {
         if (includeStateList.contains(action.getState()))
         {
            filteredList.add(action);
         }
      }
      return filteredList;
   }

   private Collection<ValidationAction> mergeCustomisedStateToAllValidations(Map<String, String> customizedValidations)
   {
      Collection<ValidationAction> allValidations = getValidationFactory().getAllValidationActions().values();

      for (ValidationAction valAction : allValidations)
      {
         String name = valAction.getId().name();
         if (customizedValidations.containsKey(name))
         {
            State persistedState = State.valueOf(customizedValidations.get(name));
            valAction.setState(persistedState);
         }
      }
      return allValidations;
   }

   /**
    * Get validation id of the HProjectIteration with includeStates. Leave includeStates empty to get all states
    * @param version
    * @return
    */
   private List<ValidationId> getValidationIds(HProjectIteration version, State... includeStates)
   {
      Map<String, String> customizedValidations = Maps.newHashMap();
      List<State> includeStateList = Arrays.asList(includeStates);

      List<ValidationId> filteredValidationIds = new ArrayList<ValidationId>();

      if (version != null)
      {
         customizedValidations = version.getCustomizedValidations();

         /**
          * Inherits validations from project if version has no defined validations
          */
         if (customizedValidations.isEmpty())
         {
            customizedValidations = version.getProject().getCustomizedValidations();
         }
      }

      Collection<ValidationAction> mergedList = mergeCustomisedStateToAllValidations(customizedValidations);

      for (ValidationAction action : mergedList)
      {
         if (includeStateList.isEmpty() || includeStateList.contains(action.getState()))
         {
            filteredValidationIds.add(action.getId());
         }
      }
      return filteredValidationIds;
   }

   /**
    * USE_COMBINE_CACHE method combine last translated info, document has
    * validation error into single cache list. However this might cause some
    * overhead/slowness if request has no intention of getting the validation
    * result. Using USE_COMBINE_CACHE will trigger validation runs against
    * document/locale whenever a transUnit is updated.
    */
   private boolean USE_COMBINE_CACHE = false;

   @Override
   public boolean runDocValidations(Long hDocId, List<ValidationId> validationIds, LocaleId localeId)
   {
      log.debug("Start runDocValidations {0}", hDocId);
      Stopwatch stopwatch = new Stopwatch().start();

      boolean result;
      if (USE_COMBINE_CACHE)
      {
         DocumentStatus docStats = translationStateCacheImpl.getDocumentStatus(hDocId, localeId);
         result = docStats.hasError();
      }
      else
      {
         HDocument hDoc = documentDAO.findById(hDocId, false);
         result = documentHasWarningOrError(hDoc, validationIds, localeId);
      }

      log.debug("Finished runDocValidations in " + stopwatch);
      return result;
   }

   @Override
   public boolean runDocValidationsWithServerRules(HDocument hDoc, LocaleId localeId)
   {
      log.debug("Start runDocValidationsWithServerRules {0}", hDoc.getId());
      Stopwatch stopwatch = new Stopwatch().start();

      List<ValidationId> validationIds = getValidationIds(hDoc.getProjectIteration(), State.Warning, State.Error);

      boolean hasError = documentHasWarningOrError(hDoc, validationIds, localeId);

      log.debug("Finished runDocValidationsWithServerRules in " + stopwatch);
      return hasError;
   }

   private boolean documentHasWarningOrError(HDocument hDoc, List<ValidationId> validationIds, LocaleId localeId)
   {
      for (HTextFlow textFlow : hDoc.getTextFlows())
      {
         boolean hasError = textFlowTargetHasWarningOrError(textFlow.getId(), validationIds, localeId);
         if (hasError)
         {
            // return true if error found, else continue
            return true;
         }
      }
      return false;
   }

   @Override
   public List<HTextFlow> filterHasWarningOrErrorTextFlow(List<HTextFlow> textFlows, List<ValidationId> validationIds,
         LocaleId localeId, int startIndex, int maxSize)
   {
      log.debug("Start filter {0} textFlows", textFlows.size());
      Stopwatch stopwatch = new Stopwatch().start();

      List<HTextFlow> result = new ArrayList<HTextFlow>();

      for (HTextFlow textFlow : textFlows)
      {
         boolean hasWarningOrError = textFlowTargetHasWarningOrError(textFlow.getId(), validationIds, localeId);
         if (hasWarningOrError)
         {
            result.add(textFlow);
         }
      }
      log.debug("Finished filter textFlows in " + stopwatch);

      if (result.size() <= maxSize)
      {
         return result;
      }

      int toIndex = startIndex + maxSize;

      toIndex = toIndex > result.size() ? result.size() : toIndex;
      startIndex = startIndex > toIndex ? toIndex - maxSize : startIndex;
      startIndex = startIndex < 0 ? 0 : startIndex;

      return result.subList(startIndex, toIndex);
   }

   private boolean textFlowTargetHasWarningOrError(Long textFlowId, List<ValidationId> validationIds, LocaleId localeId)
   {
      HTextFlowTarget target = textFlowTargetDAO.getTextFlowTarget(textFlowId, localeId);
      if (target != null)
      {
         for (ValidationId validationId : validationIds)
         {
            Boolean value = translationStateCacheImpl.textFlowTargetHasWarningOrError(target.getId(), validationId);
            if (value != null && value.booleanValue())
            {
               return value.booleanValue();
            }
         }
      }
      return false;
   }

   @Override
   public List<String> runUpdateRequestValidationsWithServerRules(HProjectIteration projectVersion,
         List<String> sources, List<String> translations)
   {
      Collection<ValidationAction> validationActions = getValidationAction(projectVersion, State.Error);
      List<String> errorList = Lists.newArrayList();

      String tf_content0 = sources.get(0);
      String tft_content0 = translations.get(0);

      for (ValidationAction action : validationActions)
      {
         errorList.addAll(action.validate(tf_content0, tft_content0));
      }

      return errorList;
   }
}
