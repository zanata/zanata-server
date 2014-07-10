/*
 * jQuery File Upload Plugin JS Example 8.9.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global $, window */

$(function () {
    'use strict';

    $('.fileupload').each(function() {
        var $doc = $(document),
            uploadForm = $(this),
            url = uploadForm.attr('action'),
            dropZone = uploadForm.find('.drag-drop'),
            filesList = uploadForm.find('.files'),
            errorList = uploadForm.find('.js-errors'),
            startButton = uploadForm.find('.js-fileupload-main-start'),
            doneButton = uploadForm.find('.fileupload-done'),
            cancelButton = uploadForm.find('.fileupload-cancel'),
            closeButton = uploadForm.find('.fileupload-close'),
            closeButtons = doneButton.add(cancelButton).add(closeButton),
            container = uploadForm.closest('.modal'),
            revealButtonId = container.attr('id') + '-toggle-button',
            revealButton = $('#' + revealButtonId),
            countIndicator = uploadForm.find('.js-file-count'),
            filePathField = uploadForm.find('input[name=filepath]'),
            fileParamsField = uploadForm.find('textarea[name=fileparams]'),
            showFileCount = (function showFileCount (numberOfFiles) {
                var noFiles = numberOfFiles === 0;
                // FIXME i18n on this string
                countIndicator.text((noFiles ? 'No' : numberOfFiles) + ' document' + (numberOfFiles === 1 ? '' : 's') + ' queued');
                // start button should only be enabled if there are files to upload
                startButton.attr('disabled', noFiles);
                if (noFiles) {
                    $('.js-files-panel').addClass('is-hidden');
                } else {
                    $('.js-files-panel').removeClass('is-hidden');
                }
            }),
            updateCountIndicator = (function updateCountIndicator (options) {
                var numberOfFiles = options.getNumberOfFiles();
                showFileCount(numberOfFiles);
            }),
            resetUploadForm = (function resetUploadForm () {
                errorList.empty();
                // individual items should clean up any resources they use
                filesList.find('.cancel').click();
                // remove items that don't have a cancel button
                filesList.empty();
                startButton.removeClass('is-hidden')
                           .attr('disabled', true)
                           .text('Upload Documents');
                doneButton.addClass('is-hidden').prop('disabled', true);
                cancelButton.removeClass('is-hidden').prop('disabled', false);
                dropZone.removeClass('is-hidden');
                // clear out path and custom attributes
                filePathField.val('');
                fileParamsField.val('');
                $('.js-files-panel').addClass('is-hidden');

                showFileCount(0);
            }),
            updateUploadCountIndicator = (function updateUploadCountIndicator (options) {
                var totalFiles = options.getNumberOfFiles(),
                    uploadedFiles = options.getNumberOfUploadedFiles();
                countIndicator.text('Uploaded ' + uploadedFiles + ' of ' + totalFiles + ' files');
                if (uploadedFiles === totalFiles) {
                    startButton.addClass('is-hidden').prop('disabled', true);
                    doneButton.removeClass('is-hidden').prop('disabled', false);
                    cancelButton.addClass('is-hidden').prop('disabled', true);
                }
            });

        // move the container to the end of the body so it is on top of everything
        container.appendTo('body');

        revealButton.bind('click', resetUploadForm);

        closeButtons.bind('click', function (e) {
            zanata.modal.hide('#' + container.attr('id'));
            // refreshStatistics() is provided by the JSF page,
            // it will cause the document list to be updated with uploaded documents.
            refreshStatistics();
        });

        // prevent default file drop behaviour on the page
        $doc.bind('drop dragover', function (e) {
            e.preventDefault();
        });

        dropZone.bind('drop dragleave dragend', function (e) {
            e.preventDefault();
            dropZone.removeClass('is-active');
        });
        dropZone.bind('dragover', function (e) {
            e.preventDefault();
            dropZone.addClass('is-active');
        });

        var accepted = uploadForm.data('accepted') || '';
        var acceptedTypes = (function (commaSeparated) {
            var types = commaSeparated.split(',');
            $.each(types, function (i, type) {
                types[i] = type.trim();
            });
            return new RegExp('(\.|\/)(' + types.join('|') + ')$', 'i');
        })(accepted);

        if (accepted.trim().length === 0) {
            uploadForm.find('.js-upload-supported').addClass('is-hidden');
        } else {
            uploadForm.find('.js-upload-not-supported').addClass('is-hidden');
        }

        var maxFilesString = uploadForm.data('maxfiles');
        var maxFiles = parseInt(maxFilesString);
        if (typeof maxFiles !== 'number' || isNaN(maxFiles)) {
            maxFiles = 100; // default fallback if it is not properly configured
        }


        uploadForm.fileupload({
            url: url,
            sequentialUploads: true,
            maxFileSize: 200*1024*1024,
            maxNumberOfFiles: maxFiles,
            dropZone: dropZone,
            beforeAdd: (function beforeAdd (e, data) {
                errorList.empty();
                startButton.attr('disabled', true);
            }),
            afterAdd: (function afterAdd (e, data) {
                updateCountIndicator(data);
            }),
            errorList: errorList,
            acceptFileTypes: acceptedTypes,
            failed: (function updateCount (e, data) {
                // update count when removing files
                var $this = $(this),
                    that = $this.data('blueimp-fileupload') ||
                           $this.data('fileupload'),
                    options = that.options;
                // FIXME may want to make sure this doesn't trigger update while
                //       uploading. Alternative: make this function aware of
                //       current uploading state.
                updateCountIndicator(options);
            }),
            completed: (function completed (e, data) {
                var $this = $(this),
                that = $this.data('blueimp-fileupload') ||
                       $this.data('fileupload'),
                options = that.options;
                updateUploadCountIndicator(options);
            }),
            updateUploadCountIndicator: updateUploadCountIndicator
        });

        // FIXME may be unnecessary. If necessary, it could just go in the above options
        // Enable iframe cross-domain access via redirect option:
        uploadForm.fileupload(
            'option',
            'redirect',
            window.location.href.replace(
                /\/[^\/]*$/,
                '/cors/result.html?%s'
            )
        );
    });

});
