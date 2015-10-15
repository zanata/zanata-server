import Dispatcher from '../dispatchers/GlossaryDispatcher';
import {GlossaryActionTypes} from '../constants/ActionTypes';


var Actions = {
  changeTransLocale: function(selectedLocale) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.TRANS_LOCALE_SELECTED,
      data: selectedLocale
    });
  },
  saveGlossary: function(srcLocaleId, term, pos, description) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.INSERT_GLOSSARY,
      data: {
        srcLocaleId: srcLocaleId,
        term: term,
        pos: pos,
        description: description
      }
    });
  },
  updateGlossary: function(contentHash) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.UPDATE_GLOSSARY,
      data: contentHash
    });
  },
  deleteGlossary: function(contentHash) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.DELETE_GLOSSARY,
      data: {
       contentHash: contentHash
      }
    });
  },
  updateFilter: function(filter) {
    Dispatcher.handleViewAction({
        actionType: GlossaryActionTypes.UPDATE_FILTER,
        data: filter
    });
  },
  updateSortOrder: function(field, ascending) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.UPDATE_SORT_ORDER,
      data: {
        field:field,
        ascending: ascending
      }
    });
  },
  uploadFile: function(uploadFile, srcLocale) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.UPLOAD_FILE,
      data: {
        uploadFile: uploadFile,
        srcLocale: srcLocale
      }
    });
  },
  loadGlossary: function(index) {
    Dispatcher.handleViewAction({
        actionType: GlossaryActionTypes.LOAD_GLOSSARY,
        data: index
    });
  },
  updateEntryField: function (contentHash, field, value) {
    Dispatcher.handleViewAction({
          actionType: GlossaryActionTypes.UPDATE_ENTRY_FIELD,
          data: {
            contentHash: contentHash,
            field: field,
            value: value
          }
    });
  },
  updateComment: function (contentHash, value) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.UPDATE_COMMENT,
      data: {
        contentHash: contentHash,
        value: value
      }
    });
  },
  updateFocusedRow: function (contentHash, rowIndex) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.UPDATE_FOCUSED_ROW,
      data: {
        rowIndex: rowIndex,
        contentHash: contentHash
      }
    });
  },
  resetEntry: function(contentHash) {
    Dispatcher.handleViewAction({
        actionType: GlossaryActionTypes.RESET_ENTRY,
        data: contentHash
      });
  }
};

export default Actions;
