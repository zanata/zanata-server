import Dispatcher from '../dispatchers/GlossaryDispatcher';
import assign from 'object-assign';
import {EventEmitter} from 'events';
import Configs from '../constants/Configs';
import {GlossaryActionTypes} from '../constants/ActionTypes';
import GlossaryHelper from '../utils/GlossaryHelper'
import StringUtils from '../utils/StringUtils'
import DateHelpers from '../utils/DateHelper'
import _ from 'lodash';
import GlossaryAPIStore from './GlossaryAPIStore'

var PAGE_SIZE = 1000,
  CHANGE_EVENT = "change",
  MAX_LISTENERS = 100, //overriding number of listener for GlossaryStore. (default is 11)
  SEVERITY = {
    INFO : 'info',
    WARN : 'warning',
    ERROR: 'error'
  };


EventEmitter.prototype.setMaxListeners(MAX_LISTENERS);

var _state = {
  canAddNewEntry: false,
  canUpdateEntry: false,
  localeOptions: [],
  srcLocale: null,
  selectedTransLocale: null,
  locales: null,
  glossary: {},
  original_glossary: {},
  glossaryIds: [],
  page:1,
  filter: '',
  focusedRow: {
    rowIndex: -1
  },
  uploadFile: {
    show: false,
    status : -1,
    file: null,
    transLocale: null
  },
  sort: {
    src_content: true
  },
  totalCount: 0,
  newEntry: {
    term: '',
    pos: '',
    description: '',
    isSaving: false,
    show: false,
    isAllowSave: false
  },
  loadingEntries: true
};

function processLocalesStatistic(res) {
  if(res.error) {
    setErrorMessage(res);
  } else {
    var body = res.body;
    _state.locales = {};
    _state.localeOptions = [];
    _state.srcLocale = body['srcLocale'];
    resetCache();

    for (var i = 0; i < _state.srcLocale.numberOfTerms; i++) {
      _state.glossaryIds[i] = null;
    }

    _.forEach(body.transLocale, function(transLocale) {
      _state.locales[transLocale.locale.localeId] = transLocale;
      _state.localeOptions.push({
        value: transLocale.locale.localeId,
        label: `${transLocale.locale.displayName} - (${transLocale.numberOfTerms})`
      });
    });
  }
  return _state;
}

function loadGlossaryByLocale() {
  _state.loadingEntries = true;
  return GlossaryAPIStore.loadGlossaryByLocale(_state.srcLocale,
    _state.selectedTransLocale, _state.filter, _state.sort, _state.page,
    PAGE_SIZE);
}

function canAddNewEntry () {
 return Configs.data.permission.insertGlossary;
}

function canUpdateEntry() {
  return Configs.data.permission.updateGlossary;
}

function processGlossaryList(res) {
  if(res.error) {
    setErrorMessage(res);
  } else {
    var transLocaleId = _state.selectedTransLocale,
      page = _state.page,
      body = res.body;

    _state.totalCount = body.totalCount;

    var startIndex = ((page -1) * PAGE_SIZE);

    _.forOwn(body.results, function(entry) {
      _state.glossary[entry.id] = GlossaryHelper.generateEntry(entry, transLocaleId);
      _state.glossary[entry.id].status['isSrcValid'] = GlossaryHelper.isSourceValid( _state.glossary[entry.id]);
      _state.glossary[entry.id].status['canUpdateTransComment'] = GlossaryHelper.canUpdateTransComment( _state.glossary[entry.id]);
      _state.glossaryIds[startIndex] = [entry.id];
      startIndex++;
    });
    _state.original_glossary = _.cloneDeep(_state.glossary);
    _state.loadingEntries = false;
  }
  return _state;
}

function saveGlossary(data) {
  var entry = {
    id: '', pos: data.pos, description: data.description,
    srcTerm: GlossaryHelper.generateSrcTerm(data.srcLocaleId)
  };
  entry.srcTerm.content = data.term;
  var glossaryEntry = GlossaryHelper.generateGlossaryEntryDTO(entry);
  return GlossaryAPIStore.saveOrUpdateGlossary([glossaryEntry]);
}

function updateGlossary(entry) {
  entry.status.isSaving = true;
  var glossaryEntry = GlossaryHelper.generateGlossaryEntryDTO(entry);
  return GlossaryAPIStore.saveOrUpdateGlossary([glossaryEntry]);
}

function onUploadFile(percentCompleted) {
  _state.uploadFile.status = percentCompleted;
}

function processUploadFile(res) {
  _state.uploadFile.status = -1;
  _state.uploadFile.show = false;
  _state.uploadFile.transLocale = null;
  _state.uploadFile.file = null;

  if(res.error) {
    setErrorMessage('We were unable to process your file. Please contact our admin to resolve this issue.', res);
  } else {
    setInfoMessage('File uploaded successfully.', '');
  }
}

function processDelete(res) {
  if(res.error) {
    setErrorMessage('We were unable to delete this glossary entry. Please contact our admin to resolve this issue.', res);
  } else {
    setInfoMessage('Entry deleted successfully.', '');
  }
}

function processSave(res) {
  _.assign(_state.newEntry, {
    isSaving: false,
    show: false,
    isAllowSave: false,
    pos: '',
    term: '',
    description: ''
  });
  if(res.error) {
    setErrorMessage('We were unable to save your changes. Please refresh this page and try again.', res);
    return;
  } else if(!_.isEmpty(res.body.warnings)) {
    setWarningMessage('Warning during update', res.body.warnings);
    return;
  }
  setInfoMessage('Glossary created successfully.', '');
}

function processUpdate(res, resId) {
  _state.glossary[resId].status = GlossaryHelper.getDefaultEntryStatus();
  if(res.error) {
    setErrorMessage('We were unable to save your changes. Please refresh this page and try again.', res);
    return;
  } else if(!_.isEmpty(res.body.warnings)) {
    setWarningMessage('Warning during update', res.body.warnings);
    return;
  }
  setInfoMessage('Changes saved successfully.', '');

}

/**
 * display error message
 * @param res - server response
 */
function setErrorMessage(msg, res) {
  var details = res.status + ':' + res.error.toString();
  console.error(details);
  _state.notification = {
    SEVERITY: SEVERITY.ERROR,
    SUBJECT: 'We are sorry',
    MESSAGE: msg,
    DETAILS: details
  };
}

/**
 * Need notification feature to output message
 *
 * display info message
 * @param msg - message to display
 */
function setInfoMessage(subject, msg) {
  console.info(subject, msg);
}

function setWarningMessage(msg, details) {
  console.warn(msg, details);
  _state.notification = {
    SEVERITY: SEVERITY.WARN,
    SUBJECT: 'Warning',
    MESSAGE: msg,
    DETAILS: details
  };
}

function refreshGlossaryEntries() {
  //load permission here
  _state.canAddNewEntry = canAddNewEntry();
  _state.canUpdateEntry = canUpdateEntry();

  GlossaryAPIStore.loadLocalesStats()
    .then(processLocalesStatistic)
    .then(loadGlossaryByLocale)
    .then(processGlossaryList)
    .then(() => GlossaryStore.emitChange());
}

function resetCache() {
  _.assign(_state, {
    page: 1,
    glossary: {},
    glossaryIds: [],
    sort:{
      src_content: true
    }
  });
}

var GlossaryStore = assign({}, EventEmitter.prototype, {
  init: function() {
    if (_state.locales === null) {
      refreshGlossaryEntries();
    }
    return _state;
  }.bind(this),

  getEntry: function(id) {
    return _state.glossary[id];
  },

  getSort: function(field) {
    return _state.sort[field];
  },

  getFocusedRow: function() {
    return _state.focusedRow;
  },

  getNewEntryState: function() {
    return _state.newEntry;
  },

  getUploadFileState: function() {
    return _state.uploadFile;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  _onTranslationLocaleChanged: function (data) {
    console.debug('select language', data);
    _state.selectedTransLocale = data;
    resetCache();
    loadGlossaryByLocale()
      .then(processGlossaryList)
      .then(() => GlossaryStore.emitChange());
  },

  _onSaveGlossary: function(data) {
    console.debug('save glossary', data);
    _state.newEntry.isSaving = true;
    _state.newEntry.show = true;
    GlossaryStore.emitChange();

    saveGlossary(data)
      .then(processSave)
      .then(refreshGlossaryEntries);
  },

  _onUpdateGlossary: function(data) {
    console.debug('update glossary', _state.glossary[data]);
    updateGlossary(_state.glossary[data])
      .then(function(res) {
        processUpdate(res, data);
      })
      .then(refreshGlossaryEntries);
  },

  _onDeleteGlossary: function(data) {
    console.debug('delete entry', data);
    GlossaryAPIStore.deleteGlossary(data)
      .then(processDelete)
      .then(refreshGlossaryEntries);
  },

  _onUpdateFilter: function(data) {
    console.debug('Update filter', data);
    if(_state.filter !== data) {
      _state.filter = data;
      refreshGlossaryEntries();
    }
  },

  _onLoadGlossary: function(data) {
    console.debug('load glossary', data);
    var pageSize = data % PAGE_SIZE === 0 ? PAGE_SIZE - 1 : PAGE_SIZE;
    _state.page = Math.ceil(data/pageSize);
    _state.page = Math.max(_state.page, 1);
    loadGlossaryByLocale()
      .then(processGlossaryList)
      .then(() => GlossaryStore.emitChange());
  },

  _onUpdateSortOrder: function(data) {
    console.debug('Update sort order', data);
    _state.sort = {};
    _state.sort[data.field] = data.ascending;
    loadGlossaryByLocale()
      .then(processGlossaryList)
      .then(() => GlossaryStore.emitChange());
  },

  _onUploadFile: function(data) {
    console.debug('Upload file', data);
    GlossaryAPIStore.uploadFile(data, onUploadFile)
      .then(processUploadFile)
      .then(resetCache)
      .then(loadGlossaryByLocale)
      .then(processGlossaryList)
      .then(() => GlossaryStore.emitChange());
  },

  _onUpdateEntryField: function(data) {
    _.set(_state.glossary[data.id], data.field, data.value);
    _state.glossary[data.id]['status'] =
      GlossaryHelper.getEntryStatus(_state.glossary[data.id], _state.original_glossary[data.id]);
    GlossaryStore.emitChange();
  },

  _onUpdateComment: function(data) {
    console.debug('Update comment', data);
    _.set(_state.glossary[data.id], 'transTerm.comment', data.value);
    updateGlossary(_state.glossary[data.id])
      .then(processUpdate)
      .then(refreshGlossaryEntries);
  },

  _onUpdateFocusRow: function(data) {
    var previousId = _state.focusedRow.id,
      previousRowIndex = _state.focusedRow.rowIndex;
    //same index, ignore
    if(previousRowIndex === data.rowIndex) {
      return;
    }

    if(previousRowIndex !== -1 && previousId !== null) {
      var entry = _state.glossary[previousId];
      if(entry && (entry.status.isSrcModified || entry.status.isTransModified)) {
        entry.status.isSaving = true;
        GlossaryStore.emitChange();
        GlossaryStore._onUpdateGlossary(previousId);
      }
    }
    _state.focusedRow = data;
    GlossaryStore.emitChange();
  },

  _onResetEntry: function(data) {
    console.debug('reset entry', data);
    _state.glossary[data] = _.cloneDeep(_state.original_glossary[data]);
    GlossaryStore.emitChange();
  },

  dispatchToken: Dispatcher.register(function(payload) {
    const action = payload.action;
    switch (action.actionType) {
      case GlossaryActionTypes.TRANS_LOCALE_SELECTED:
        GlossaryStore._onTranslationLocaleChanged(action.data);
        break;
      case GlossaryActionTypes.INSERT_GLOSSARY:
        GlossaryStore._onSaveGlossary(action.data);
        break;
      case GlossaryActionTypes.UPDATE_GLOSSARY:
        GlossaryStore._onUpdateGlossary(action.data);
        break;
      case GlossaryActionTypes.DELETE_GLOSSARY:
        GlossaryStore._onDeleteGlossary(action.data);
        break;
      case GlossaryActionTypes.UPDATE_FILTER:
        GlossaryStore._onUpdateFilter(action.data);
        break;
      case GlossaryActionTypes.LOAD_GLOSSARY:
        GlossaryStore._onLoadGlossary(action.data);
        break;
       case GlossaryActionTypes.UPDATE_SORT_ORDER:
         GlossaryStore._onUpdateSortOrder(action.data);
         break;
      case GlossaryActionTypes.UPLOAD_FILE:
        GlossaryStore._onUploadFile(action.data);
        break;
      case GlossaryActionTypes.UPDATE_ENTRY_FIELD:
        GlossaryStore._onUpdateEntryField(action.data);
        break;
      case GlossaryActionTypes.UPDATE_COMMENT:
        GlossaryStore._onUpdateComment(action.data);
        break;
      case GlossaryActionTypes.UPDATE_FOCUSED_ROW:
        GlossaryStore._onUpdateFocusRow(action.data);
        break;
      case GlossaryActionTypes.RESET_ENTRY:
        GlossaryStore._onResetEntry(action.data);
        break;
      case GlossaryActionTypes.CLEAR_MESSAGE:
        _state.notification = null;
        GlossaryStore.emitChange();
        break;
    }
  })
});
export default GlossaryStore;
