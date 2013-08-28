package org.zanata.webtrans.client.ui;

import java.util.List;
import java.util.Map;

import org.zanata.webtrans.shared.model.ValidationInfo;

public interface HasUpdateValidationWarning
{
   void updateValidationWarning(Map<ValidationInfo, List<String>> errors);
}
