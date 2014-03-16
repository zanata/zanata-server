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
        var uploadForm = $(this),
            dropZone = uploadForm.find('.drag-drop')

        uploadForm.fileupload({
            sequentialUploads: true,
            dropZone: dropZone,
            acceptFileTypes: /(\.|\/)(pot|dtd|txt|idml|html?|od[tpsg])$/i
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
