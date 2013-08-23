/**
 * 
 */
package org.zanata.service.impl;

import java.util.ArrayList;
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
   private TransUnitTransformer transUnitTransformer;

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
      Collection<ValidationAction> allValidations = getValidationFactory().getAllValidationActions().values();
      Map<String, String> customizedValidations = Maps.newHashMap();

      if (!StringUtils.isEmpty(projectSlug))
      {
         HProject project = projectDAO.getBySlug(projectSlug);
         customizedValidations = project.getCustomizedValidations();
      }

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

   @Override
   public Collection<ValidationAction> getValidationAction(String projectSlug, String versionSlug)
   {
      Collection<ValidationAction> validationList = null;

      if (!StringUtils.isEmpty(projectSlug))
      {
         HProjectIteration version = projectIterationDAO.getBySlug(projectSlug, versionSlug);

         validationList = getValidationObject(version);
      }

      return validationList;
   }

   @Override
   public Collection<ValidationAction> getValidationObject(HProjectIteration version)
   {
      Collection<ValidationAction> allValidations = getValidationFactory().getAllValidationActions().values();

      Map<String, String> customizedValidations = Maps.newHashMap();

      if (version != null)
      {
         customizedValidations = version.getCustomizedValidations();

         // Inherits validations from project if version has no defined
         // validations
         if (customizedValidations.isEmpty())
         {
            customizedValidations = version.getProject().getCustomizedValidations();
         }
      }
      

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

   private List<ValidationId> getWarnOrErrorValidationIds(HProjectIteration version)
   {
      Collection<ValidationAction> allValidations = getValidationFactory().getAllValidationActions().values();
      Map<String, String> customizedValidations = Maps.newHashMap();
      
      List<ValidationId> warnOrErrorValidationIds = new ArrayList<ValidationId>();

      if (version != null)
      {
         customizedValidations = version.getCustomizedValidations();

         // Inherits validations from project if version has no defined
         // validations
         if (customizedValidations.isEmpty())
         {
            customizedValidations = version.getProject().getCustomizedValidations();
         }
      }

      for (ValidationAction valAction : allValidations)
      {
         if (customizedValidations.containsKey(valAction.getId().name()))
         {
            warnOrErrorValidationIds.add(valAction.getId());
         }
      }
      return warnOrErrorValidationIds;
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
         result = documentHasError(hDoc, validationIds, localeId);
      }

      log.debug("Finished runDocValidations in " + stopwatch);
      return result;
   }

   @Override
   public boolean runDocValidationsWithServerRules(HDocument hDoc, LocaleId localeId)
   {
      log.debug("Start runDocValidationsWithServerRules {0}", hDoc.getId());
      Stopwatch stopwatch = new Stopwatch().start();

      List<ValidationId> validationIds = getWarnOrErrorValidationIds(hDoc.getProjectIteration());

      boolean hasError = documentHasError(hDoc, validationIds, localeId);

      log.debug("Finished runDocValidationsWithServerRules in " + stopwatch);
      return hasError;
   }

   private boolean documentHasError(HDocument hDoc, List<ValidationId> validationIds, LocaleId localeId)
   {
      for (HTextFlow textFlow : hDoc.getTextFlows())
      {
         boolean hasError = textFlowTargetHasError(textFlow.getId(), validationIds, localeId);
         if (hasError)
         {
            // return true if error found, else continue
            return true;
         }
      }
      return false;
   }

   @Override
   public List<HTextFlow> filterHasErrorTexFlow(List<HTextFlow> textFlows, List<ValidationId> validationIds, LocaleId localeId, int startIndex, int maxSize)
   {
      log.debug("Start filter {0} textFlows", textFlows.size());
      Stopwatch stopwatch = new Stopwatch().start();

      List<HTextFlow> result = new ArrayList<HTextFlow>();

      for (HTextFlow textFlow : textFlows)
      {
         boolean hasError = textFlowTargetHasError(textFlow.getId(), validationIds, localeId);
         if (hasError)
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

   private boolean textFlowTargetHasError(Long textFlowId, List<ValidationId> validationIds, LocaleId localeId)
   {
      HTextFlowTarget target = textFlowTargetDAO.getTextFlowTarget(textFlowId, localeId);
      if (target != null)
      {
         for (ValidationId validationId : validationIds)
         {
            Boolean value = translationStateCacheImpl.textFlowTargetHasError(target.getId(), validationId);
            if (value != null && value.booleanValue())
            {
               return value.booleanValue();
            }
         }
      }
      return false;
   }
}
