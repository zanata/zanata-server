import Dispatcher from '../dispatchers/GlossaryDispatcher';
import {GlossaryActionTypes} from '../constants/ActionTypes';


var Actions = {
  changeTransLocale: function(selectedLocale) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.TRANS_LOCALE_SELECTED,
      data: selectedLocale
    });
  },
  createGlossary: function(resId) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.INSERT_GLOSSARY,
      data: resId
    });
  },
  updateGlossary: function(resId) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.UPDATE_GLOSSARY,
      data: resId
    });
  },
  deleteGlossary: function(resId) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.DELETE_GLOSSARY,
      data: {
       resId: resId,
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
  updateEntryField: function (resId, field, value) {
    Dispatcher.handleViewAction({
          actionType: GlossaryActionTypes.UPDATE_ENTRY_FIELD,
          data: {
            resId: resId,
            field: field,
            value: value
          }
    });
  },
  updateComment: function (resId, value) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.UPDATE_COMMENT,
      data: {
        resId: resId,
        value: value
      }
    });
  },
  updateFocusedRow: function (resId, rowIndex) {
        Dispatcher.handleViewAction({
          actionType: GlossaryActionTypes.UPDATE_FOCUSED_ROW,
          data: {
            rowIndex: rowIndex,
            resId: resId
          }
        });
  }
};

export default Actions;
