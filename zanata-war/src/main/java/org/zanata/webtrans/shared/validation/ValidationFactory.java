/**
 * 
 */
package org.zanata.webtrans.shared.validation;

import java.util.*;

import org.zanata.webtrans.client.resources.*;
import org.zanata.webtrans.shared.model.*;
import org.zanata.webtrans.shared.model.ValidationAction.*;
import org.zanata.webtrans.shared.validation.action.*;

import com.google.common.collect.*;

/**
 * Validation Factory - provides list of available validation rules to run on server or client.
 * 
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public final class ValidationFactory
{
   private final ValidationMessages validationMessages;

   private final Map<ValidationId, ValidationAction> referenceMap;

   public static Comparator<ValidationId> ValidationIdComparator = new Comparator<ValidationId>()
   {
      @Override
      public int compare(ValidationId o1, ValidationId o2)
      {
         return o1.getDisplayName().compareTo(o2.getDisplayName());
      }
   };

   public static final Comparator<ValidationAction> ValidationActionComparator = new Comparator<ValidationAction>()
   {
      @Override
      public int compare(ValidationAction o1, ValidationAction o2)
      {
         return o1.getId().getDisplayName().compareTo(o2.getId().getDisplayName());
      }
   };

   public ValidationFactory(ValidationMessages validationMessages)
   {
      this.validationMessages = validationMessages;
      referenceMap = generateActions();
   }

   /**
    * Generate all Validation Actions with default states(Warning)
    * 
    * @return Map<ValidationId, ValidationAction>
    */
   public Map<ValidationId, ValidationAction> getAllValidationActions()
   {
      return generateActions();
   }

   public ValidationAction getValidationAction(ValidationId id)
   {
      return referenceMap.get(id);
   }

   private Map<ValidationId, ValidationAction> generateActions()
   {
      TreeMap<ValidationId, ValidationAction> validationMap = Maps.newTreeMap();

      validationMap.put(ValidationId.HTML_XML, new HtmlXmlTagValidation(ValidationId.HTML_XML, validationMessages));
      validationMap.put(ValidationId.JAVA_VARIABLES, new JavaVariablesValidation(ValidationId.JAVA_VARIABLES,
            validationMessages));
      validationMap.put(ValidationId.NEW_LINE, new NewlineLeadTrailValidation(ValidationId.NEW_LINE,
            validationMessages));

      PrintfVariablesValidation printfVariablesValidation = new PrintfVariablesValidation(
            ValidationId.PRINTF_VARIABLES, validationMessages);
      PrintfXSIExtensionValidation positionalPrintfValidation = new PrintfXSIExtensionValidation(
            ValidationId.PRINTF_XSI_EXTENSION, validationMessages);
      positionalPrintfValidation.setState(State.Off);

      printfVariablesValidation.mutuallyExclusive(positionalPrintfValidation);
      positionalPrintfValidation.mutuallyExclusive(printfVariablesValidation);

      validationMap.put(ValidationId.PRINTF_VARIABLES, printfVariablesValidation);
      validationMap.put(ValidationId.PRINTF_XSI_EXTENSION, positionalPrintfValidation);
      validationMap.put(ValidationId.TAB, new TabValidation(ValidationId.TAB, validationMessages));
      validationMap.put(ValidationId.XML_ENTITY, new XmlEntityValidation(ValidationId.XML_ENTITY, validationMessages));

      return validationMap;
   }
}
