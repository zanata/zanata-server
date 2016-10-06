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

import org.zanata.webtrans.client.keys.ShortcutContext;
import org.zanata.webtrans.client.resources.WebTransMessages;
import org.zanata.webtrans.shared.model.DiffMode;

import com.google.gwt.core.shared.GWT;
import com.google.gwt.resources.client.CssResource;
import com.google.gwt.uibinder.client.UiBinder;
import com.google.gwt.uibinder.client.UiField;
import com.google.gwt.user.client.ui.HTMLPanel;
import com.google.gwt.user.client.ui.InlineLabel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.PopupPanel;
import com.google.inject.Inject;

/**
 *
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 *
 **/

public class DiffColorLegendPanel extends PopupPanel {

    interface DiffColorLegendPanelUiBinder extends
            UiBinder<HTMLPanel, DiffColorLegendPanel> {
    }

    interface Styles extends CssResource {
        String diffLegendPanel();

        String fullWidth();
    }

    @UiField
    Label insDescription, delDescription, containDescription;

    @UiField
    InlineLabel insLabel, delLabel;

    @UiField
    Styles style;

    @UiField
    WebTransMessages messages;

    private static DiffColorLegendPanelUiBinder uiBinder = GWT
            .create(DiffColorLegendPanelUiBinder.class);

    @Inject
    public DiffColorLegendPanel() {
        super(true, true);

        HTMLPanel container = uiBinder.createAndBindUi(this);
        setStyleName(style.diffLegendPanel());
        setWidget(container);
    }

    public void show(ShortcutContext context, DiffMode diffMode) {
        //reset to default style
        insLabel.setStyleName(style.fullWidth() + " diff-insert bx--inline-block l--pad-all-quarter");
        delDescription.removeStyleName("is-hidden");
        delLabel.removeStyleName("is-hidden");

        switch (context) {
        case TM:
            if (diffMode == DiffMode.NORMAL) {
                insDescription.setText(messages.tmInsertTagDesc());
                delDescription.setText(messages.tmDelTagDesc());
                containDescription.setText(messages.tmPlainTextDesc());
            } else {
                delLabel.addStyleName("is-hidden");
                delDescription.addStyleName("is-hidden");
                insLabel.setStyleName(style.fullWidth() + " CodeMirror-searching bx--inline-block l--pad-all-quarter");
                insDescription.setText(messages.tmPlainTextDesc());
                containDescription.setText(messages.tmDelTagDesc());
            }
            break;
        case ProjectWideSearch:
            insDescription.setText(messages.searchReplaceInsertTagDesc());
            delDescription.setText(messages.searchReplaceDelTagDesc());
            containDescription.setText(messages.searchReplacePlainTextDesc());
            break;
        default:
            break;
        }
        this.center();
    }
}
