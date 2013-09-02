/*
 * Copyright 2011, Red Hat, Inc. and individual contributors
 * as indicated by the @author tags. See the copyright.txt file in the
 * distribution for a full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package org.zanata.webtrans.client.ui;

import java.util.List;
import java.util.Map;

import org.zanata.webtrans.client.resources.TableEditorMessages;
import org.zanata.webtrans.client.view.TargetContentsDisplay;
import org.zanata.webtrans.shared.model.TransUnitId;
import org.zanata.webtrans.shared.model.ValidationAction;

import com.google.gwt.core.client.GWT;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.safehtml.shared.SafeHtmlBuilder;
import com.google.gwt.uibinder.client.UiBinder;
import com.google.gwt.uibinder.client.UiField;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.HTMLPanel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.PopupPanel;
import com.google.inject.Inject;

/**
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 *
 **/
public class ValidationWarningPanel extends PopupPanel implements ValidationWarningDisplay
{
   private static ValidationWarningPanelUiBinder uiBinder = GWT.create(ValidationWarningPanelUiBinder.class);

   interface ValidationWarningPanelUiBinder extends UiBinder<HTMLPanel, ValidationWarningPanel>
   {
   }

   private TransUnitId transUnitId;

   private TargetContentsDisplay.Listener listener;

   @UiField
   Label messageLabel;

   @UiField
   UnorderedListWidget translations;

   @UiField
   UnorderedListWidget errorList;

   @UiField(provided = true)
   Button returnToEditor;

   @UiField(provided = true)
   Button saveAsFuzzy;

   @Inject
   public ValidationWarningPanel(TableEditorMessages messages)
   {
      super(false, true);

      returnToEditor = new Button(messages.returnToEditor());
      saveAsFuzzy = new Button(messages.saveAsFuzzy());

      HTMLPanel container = uiBinder.createAndBindUi(this);

      messageLabel.setText("You're trying to save translation that contains validation error.");

      setGlassEnabled(true);
      setWidget(container);
      hide();
   }

   public void setListener(TargetContentsDisplay.Listener listener)
   {
      this.listener = listener;
      addListenerToButtons();
   }

   private void addListenerToButtons()
   {
      saveAsFuzzy.addClickHandler(new ClickHandler()
      {
         @Override
         public void onClick(ClickEvent event)
         {
            listener.saveAsFuzzy(transUnitId);
            hide();
         }
      });
      returnToEditor.addClickHandler(new ClickHandler()
      {
         @Override
         public void onClick(ClickEvent event)
         {
            listener.selectRow(transUnitId);
            hide();
         }
      });
   }

   @Override
   public void center(TransUnitId transUnitId, List<String> targets, Map<ValidationAction, List<String>> errorMessages)
   {
      translations.clear();
      errorList.clear();

      this.transUnitId = transUnitId;

      for (String target : targets)
      {
         SafeHtmlBuilder builder = new SafeHtmlBuilder();
         HighlightingLabel label = new HighlightingLabel(target);
         builder.appendHtmlConstant(label.getElement().getString());
         
         HTMLPanel targetLabel = new HTMLPanel("li", builder.toSafeHtml().asString());
         targetLabel.setStyleName("textFlowEntry");
         
         translations.add(targetLabel);
      }

      for (List<String> messages : errorMessages.values())
      {
         for (String message : messages)
         {
            SafeHtmlBuilder builder = new SafeHtmlBuilder();
            builder.appendEscaped(message);
            errorList.add(new HTMLPanel("li", builder.toSafeHtml().asString()));
         }
      }

      center();

   }
}
