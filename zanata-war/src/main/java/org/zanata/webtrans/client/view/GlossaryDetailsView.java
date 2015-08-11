package org.zanata.webtrans.client.view;

import java.util.Date;

import org.zanata.webtrans.client.resources.Resources;
import org.zanata.webtrans.client.resources.UiMessages;
import org.zanata.webtrans.client.util.DateUtil;

import com.google.gwt.core.shared.GWT;
import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.resources.client.CssResource;
import com.google.gwt.uibinder.client.UiBinder;
import com.google.gwt.uibinder.client.UiField;
import com.google.gwt.uibinder.client.UiHandler;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.DialogBox;
import com.google.gwt.user.client.ui.HasText;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.TextArea;
import com.google.gwt.user.client.ui.Widget;
import com.google.inject.Inject;

public class GlossaryDetailsView implements GlossaryDetailsDisplay {

    interface GlossaryDetailsIUiBinder extends
            UiBinder<DialogBox, GlossaryDetailsView> {
    }

    interface Styles extends CssResource {
    }

    private static GlossaryDetailsIUiBinder uiBinder = GWT
            .create(GlossaryDetailsIUiBinder.class);

    DialogBox dialogBox;

    @UiField
    TextArea srcRef, sourceText, targetText, targetComment, description;

    @UiField
    Label sourceLabel, targetLabel, lastModified, pos;

    @UiField
    ListBox entryListBox;

    @UiField
    Button dismissButton, saveButton;

    @UiField
    Image loadingIcon;

    @UiField
    Styles style;

    private Listener listener;

    private final UiMessages messages;

    @Inject
    public GlossaryDetailsView(UiMessages messages, Resources resources) {
        dialogBox = uiBinder.createAndBindUi(this);
        dialogBox.setText(messages.glossaryDetails());
        dismissButton.setText(messages.dismiss());
        saveButton.setText(messages.save());

        description.setReadOnly(true);
        sourceText.setReadOnly(true);
        srcRef.setReadOnly(true);

        loadingIcon.setResource(resources.spinner());
        loadingIcon.setVisible(false);
        this.messages = messages;
    }

    public void hide() {
        dialogBox.hide();
    }

    @Override
    public void setDescription(String descriptionText) {
        description.setText(descriptionText);
    }

    @Override
    public void setPos(String posText) {
        pos.setText(posText);
    }

    @Override
    public void setTargetComment(String targetCommentText) {
        targetComment.setText(targetCommentText);
    }

    public void show() {
        dialogBox.center();
    }

    @Override
    public Widget asWidget() {
        return dialogBox;
    }

    @Override
    public void setSourceText(String source) {
        sourceText.setText(source);
    }

    @Override
    public HasText getTargetComment() {
        return targetComment;
    }

    @Override
    public HasText getTargetText() {
        return targetText;
    }

    @UiHandler("entryListBox")
    public void onEntryListBoxChange(ChangeEvent event) {
        listener.selectEntry(entryListBox.getSelectedIndex());
    }

    @UiHandler("dismissButton")
    public void onDismissButtonClick(ClickEvent event) {
        listener.onDismissClick();
    }

    @UiHandler("saveButton")
    public void onSaveButtonClick(ClickEvent event) {
        listener.onSaveClick();
    }

    @Override
    public void addEntry(String text) {
        entryListBox.addItem(text);
    }

    @Override
    public void clearEntries() {
        entryListBox.clear();
    }

    @Override
    public HasText getSourceLabel() {
        return sourceLabel;
    }

    @Override
    public HasText getTargetLabel() {
        return targetLabel;
    }

    @Override
    public HasText getSrcRef() {
        return srcRef;
    }

    @Override
    public void showLoading(boolean visible) {
        loadingIcon.setVisible(visible);
    }

    @Override
    public void setHasUpdateAccess(boolean hasGlossaryUpdateAccess) {
        saveButton.setEnabled(hasGlossaryUpdateAccess);
        targetComment.setReadOnly(!hasGlossaryUpdateAccess);
        targetText.setReadOnly(!hasGlossaryUpdateAccess);
    }

    @Override
    public void setListener(Listener listener) {
        this.listener = listener;
    }

    @Override
    public void setLastModifiedDate(Date lastModifiedDate) {
        lastModified.setText(messages.lastModifiedOn(DateUtil
                .formatShortDate(lastModifiedDate)));
    }

}
