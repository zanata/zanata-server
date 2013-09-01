package org.zanata.webtrans.client.ui;

import java.util.List;
import java.util.Map;

import org.zanata.webtrans.shared.model.ValidationAction;

public interface HasUpdateValidationMessage
{
   void updateValidationMessage(Map<ValidationAction, List<String>> errors);
}
