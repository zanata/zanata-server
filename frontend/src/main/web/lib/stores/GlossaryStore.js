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

var PAGE_SIZE = 20,
  CHANGE_EVENT = "change",
  MAX_LISTENERS = 100; //number of listener for GlossaryStore (default is 11)

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
  glossaryResId: [],
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
  }
};

function processLocalesStatistic(serverResponse) {
  _state.locales = {};
  _state.localeOptions = [];
  _state.srcLocale = serverResponse['srcLocale'];
  resetCache();

  for (var i = 0; i < _state.srcLocale.numberOfTerms; i++) {
    _state.glossaryResId[i] = null;
  }

  _.forEach(serverResponse['transLocale'], function(transLocale) {
    _state.locales[transLocale.locale.localeId] = transLocale;
    _state.localeOptions.push({
      value: transLocale.locale.localeId,
      label: `${transLocale.locale.displayName} - (${transLocale.numberOfTerms})`
    });
  });
  return _state;
}

function loadGlossaryByLocale() {
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

function processGlossaryList(serverResponse) {
  if(serverResponse === null) {
    return _state;
  }
  var transLocaleId = _state.selectedTransLocale,
    page = _state.page;

  _state.totalCount = serverResponse.totalCount;

  var startIndex = ((page -1) * PAGE_SIZE);

  _.forOwn(serverResponse.glossaryEntries, function(entry) {
    var srcTerm =
      GlossaryHelper.getTermByLocale(entry.glossaryTerms, entry.srcLang);

    srcTerm.reference = entry.sourceReference;

    if(!StringUtils.isEmptyOrNull(srcTerm.lastModifiedDate)) {
      srcTerm.lastModifiedDate = DateHelpers.shortDate(DateHelpers.getDate(srcTerm.lastModifiedDate));
    }

    var transTerm =
      GlossaryHelper.getTermByLocale(entry.glossaryTerms, transLocaleId);

    if(transTerm != null) {
      transTerm.lastModifiedDate = DateHelpers.shortDate(DateHelpers.getDate(transTerm.lastModifiedDate));
      if(_.isUndefined(transTerm.comment)) {
        transTerm.comment = ''
      }
    } else {
      transTerm = GlossaryHelper.generateEmptyTerm(transLocaleId);
    }
    _state.glossary[entry.resId] = {
      resId: entry.resId,
      pos: _.isUndefined(entry.pos) ? '' : entry.pos,
      description: _.isUndefined(entry.description) ? '' : entry.description,
      termsCount: entry.termsCount > 0 ? entry.termsCount - 1 : 0 , //remove source term from count
      srcTerm: srcTerm,
      transTerm: transTerm,
      status: GlossaryHelper.getDefaultEntryStatus()
    };
    _state.glossary[entry.resId].status['isSrcValid'] = GlossaryHelper.isSourceValid( _state.glossary[entry.resId]);
    _state.glossary[entry.resId].status['canUpdateTransComment'] = GlossaryHelper.canUpdateTransComment( _state.glossary[entry.resId]);
    _state.glossaryResId[startIndex] = [entry.resId];
    startIndex+=1;
  });
  _state.original_glossary = _.cloneDeep(_state.glossary);
  return _state;
}

function saveGlossary(data) {
  var entry = {
    resId: '', pos: data.pos, description: data.description,
    srcTerm: GlossaryHelper.generateSrcTerm(data.srcLocaleId)
  };
  entry.srcTerm.content = data.term;
  var glossary = GlossaryHelper.generateGlossaryDTO(entry);
  return GlossaryAPIStore.saveOrUpdateGlossary(glossary);
}

function updateGlossary(entry) {
  entry.status.isSaving = true;
  var glossary = GlossaryHelper.generateGlossaryDTO(entry);
  return GlossaryAPIStore.saveOrUpdateGlossary(glossary);
}

function onUploadFile(percentCompleted) {
  _state.uploadFile.status = percentCompleted;
}

function processUploadFile() {
  _state.uploadFile.status = -1;
  _state.uploadFile.show = false;
  _state.uploadFile.transLocale = null;
  _state.uploadFile.file = null;
}

function processDelete(serverResponse) {
  console.debug('Glossary entry deleted');
}

function processSaveOrUpdate(serverResponse) {
  _.assign(_state.newEntry, {
    isSaving: false,
    show: false,
    isAllowSave: false,
    pos: '',
    term: '',
    description: ''
  });
  console.debug('Glossary entry saved');
}

function processUpdate(serverResponse) {
  console.debug('Glossary entry updated');
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
    glossaryResId: [],
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

  getEntry: function(resId) {
    return _state.glossary[resId];
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

  dispatchToken: Dispatcher.register(function(payload) {
    const action = payload.action;
    switch (action['actionType']) {
      case GlossaryActionTypes.TRANS_LOCALE_SELECTED:
        console.debug('select language', action.data);
        _state.selectedTransLocale = action.data;
        resetCache();
        loadGlossaryByLocale()
          .then(processGlossaryList)
          .then(() => GlossaryStore.emitChange());
        break;
      case GlossaryActionTypes.INSERT_GLOSSARY:
        console.debug('save glossary', action.data);
        _state.newEntry.isSaving = true;
        _state.newEntry.show = true;
        GlossaryStore.emitChange();

        saveGlossary(action.data)
          .then(processSaveOrUpdate)
          .then(refreshGlossaryEntries);
        break;
      case GlossaryActionTypes.UPDATE_GLOSSARY:
        console.debug('update glossary', _state['glossary'][action.data]);
        updateGlossary(_state.glossary[action.data])
          .then(processUpdate)
          .then(refreshGlossaryEntries);
        break;
      case GlossaryActionTypes.DELETE_GLOSSARY:
        console.debug('delete entry', action.data);
        GlossaryAPIStore.deleteGlossary(action.data)
          .then(processDelete)
          .then(refreshGlossaryEntries);
        break;
      case GlossaryActionTypes.UPDATE_FILTER:
        console.debug('Update filter', action.data);
        if(_state.filter  !== action.data) {
          _state.filter = action.data;
          refreshGlossaryEntries();
        }
        break;
      case GlossaryActionTypes.LOAD_GLOSSARY:
        console.debug('load glossary', action.data);
        var pageSize = action.data % PAGE_SIZE === 0 ? PAGE_SIZE - 1 : PAGE_SIZE;
        _state.page = Math.ceil(action.data/pageSize);
        _state.page = Math.max(_state.page, 1);
        loadGlossaryByLocale()
          .then(processGlossaryList)
          .then(() => GlossaryStore.emitChange());
        break;
       case GlossaryActionTypes.UPDATE_SORT_ORDER:
         console.debug('Update sort order', action.data);
         _state.sort[action.data.field] = action.data.ascending;
         loadGlossaryByLocale()
           .then(processGlossaryList)
           .then(() => GlossaryStore.emitChange());
         break;
      case GlossaryActionTypes.UPLOAD_FILE:
        console.debug('Upload file', action.data);
        GlossaryAPIStore.uploadFile(action.data, onUploadFile)
          .then(processUploadFile)
          .then(resetCache)
          .then(loadGlossaryByLocale)
          .then(processGlossaryList)
          .then(() => GlossaryStore.emitChange());
        break;
      case GlossaryActionTypes.UPDATE_ENTRY_FIELD:
        _.set(_state.glossary[action.data.resId], action.data.field, action.data.value);
        _state.glossary[action.data.resId]['status'] =
          GlossaryHelper.getEntryStatus(_state.glossary[action.data.resId], _state.original_glossary[action.data.resId]);
        GlossaryStore.emitChange();
        break;
      case GlossaryActionTypes.UPDATE_COMMENT:
        console.debug('Update comment', action.data);
        _.set(_state.glossary[action.data.resId], 'transTerm.comment', action.data.value);
        updateGlossary(_state.glossary[action.data.resId])
          .then(processSaveOrUpdate)
          .then(refreshGlossaryEntries);
        break;
      case GlossaryActionTypes.UPDATE_FOCUSED_ROW:
        var previousResId = _state.focusedRow.resId,
          previousRowIndex = _state.focusedRow.rowIndex;
        //same index, ignore
        if(previousRowIndex === action.data.rowIndex) {
          return;
        }
        if(previousRowIndex !== -1 && previousResId !== null) {
          var entry = _state.glossary[previousResId];
          if(entry && (entry.status.isSrcModified || entry.status.isTransModified)) {
            updateGlossary(entry)
                .then(processSaveOrUpdate)
                .then(refreshGlossaryEntries);
          }
        }
        _state.focusedRow = action.data;
        GlossaryStore.emitChange();
        break;
      case GlossaryActionTypes.RESET_ENTRY:
        console.debug('reset entry', action.data);
        _state.glossary[action.data] = _.cloneDeep(_state.original_glossary[action.data]);
        GlossaryStore.emitChange();
        break;
    }
  })
});
export default GlossaryStore;
