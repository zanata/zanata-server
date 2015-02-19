/*
 * Copyright 2015, Red Hat, Inc. and individual contributors as indicated by the
 * @author tags. See the copyright.txt file in the distribution for a full
 * listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */

/* Functions used in the language settings template for projects and versions.
 *
 * Uses helper functions from components-script.js
 */


/**
 * Show the inline form to enter a locale alias on the row of a specified
 * locale.
 *
 * @param currentAlias the current alias that should be shown in the input
 *        textbox initially.
 */
function showLocaleAliasInput(localeId, currentAlias) {
    var input = localeAliasInput(localeId);
    input.val(currentAlias);
    localeAliasForm(localeId).removeClass('is-hidden');
    showLocaleAliasCancelEdit(localeId);
    input.focus();
}

/**
 * Inverse of showLocaleAliasInput.
 */
function hideLocaleAliasInput(localeId) {
    localeAliasForm(localeId).addClass('is-hidden');
}

/**
 * Get the locale alias input form for a given locale.
 *
 * @returns jQuery object of the form
 */
function localeAliasForm(localeId) {
    var id = '#locale-alias-form-' + localeId;
    return jQuery(id);
}

/**
 * Get the locale alias input textbox for a given locale.
 *
 * @returns jQuery object of the textbox
 */
function localeAliasInput(localeId) {
    return localeAliasForm(localeId).find('input:text');
}

/**
 * Show the actions menu for a locale.
 *
 * This hides the locale alias loader and cancel button.
 */
function showLocaleActions(localeId) {
    var localeActions = '#language-actions-' + localeId;
    showOnlyOneOfLocaleActionStatus(localeId)(localeActions)
}

/**
 * Show the locale alias loading indicator for a locale.
 *
 * This hides the actions menu and cancel button.
 */
function showLocaleAliasLoader(localeId) {
    var aliasLoader = '#language-processing-' + localeId;
    showOnlyOneOfLocaleActionStatus(localeId)(aliasLoader)
}

/**
 * Show the button that cancels editing a locale alias.
 *
 * This hides the actions menu and loading indicator.
 */
function showLocaleAliasCancelEdit(localeId) {
    var cancelEdit = '#edit-alias-cancel-' + localeId;
    showOnlyOneOfLocaleActionStatus(localeId)(cancelEdit)
}

/**
 * Generate a function for a given locale that will show a specified element
 * in the actions area of that locale's row.
 *
 * The returned function takes a jQuery selector for the element to show.
 *
 * Usage examples:
 *
 *     // Create and use function immediately
 *     showOnlyOneOfLocaleActionStatus('en')('#language-processing-en');
 *
 *     // Create and cache function, then use it later
 *     var showOnly = showOnlyOneOfLocaleActionStatus('jp');
 *     // ...
 *     showOnly('#language-actions-jp');
 *
 * @returns function that takes a selector
 */
function showOnlyOneOfLocaleActionStatus (localeId) {
    return showOnlyOneOf('#language-actions-' + localeId,
        '#language-processing-' + localeId,
        '#edit-alias-cancel-' + localeId)
}

/**
 * Check a keydown event for Enter or Esc to submit or cancel a new locale alias.
 *
 * @param localeId which locale the alias is for
 * @param event 'keydown' event on the textbox
 * @returns {boolean} false if Enter or Esc was pressed, otherwise undefined
 */
function onLocaleAliasInputKeyDown(localeId, event) {

    if (isEnterKey(event)) {
        event.preventDefault();
        localeAliasForm(localeId).find('input:submit').click();
        return false;
    }
    if (isEscapeKey(event)) {
        event.preventDefault();
        jQuery('#edit-alias-cancel-' + localeId).find('button').click();
        return false;
    }
}

/**
 * Trigger removal of a locale alias.
 *
 * This just simulates entering nothing in the locale alias textbox and
 * submitting it.
 *
 * @param localeId locale for which to remove the alias
 * @returns {boolean} false
 */
function deleteLocaleAlias(localeId) {
    var aliasForm = localeAliasForm(localeId);
    var input = aliasForm.find('input:text');
    input.val('');
    var submitButton = aliasForm.find('input:submit');
    submitButton.click();
    return false;
}
