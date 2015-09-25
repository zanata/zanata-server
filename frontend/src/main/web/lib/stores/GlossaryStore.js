import Dispatcher from '../dispatchers/GlossaryDispatcher';
import assign from 'object-assign';
import {EventEmitter} from 'events';
import {Promise} from 'es6-promise';
import Request from 'superagent';
import Configs from '../constants/Configs';
import {GlossaryActionTypes} from '../constants/ActionTypes';
import GlossaryHelper from '../utils/GlossaryHelper'
import StringUtils from '../utils/StringUtils'
import DateHelpers from '../utils/DateHelper'
import _ from 'lodash';

var SIZE_PER_PAGE = 5000, CHANGE_EVENT = "change",
    MAX_LISTENER = 100; //number of listener for GlossaryStore (default is 11)

EventEmitter.prototype.setMaxListeners(MAX_LISTENER);

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
  focusedRow: null,
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

function localesStatAPIUrl() {
  return Configs.baseUrl + "/glossary/info" + Configs.urlPostfix
}

function loadLocalesStats() {
  var url = localesStatAPIUrl();

  return new Promise(function(resolve, reject) {
    Request.get(url)
      .set("Cache-Control", "no-cache, no-store, must-revalidate")
      .set('Accept', 'application/json')
      .set("Pragma", "no-cache")
      .set("Expires", 0)
      .end(function (err, res) {
        if(err != null && err.error === true) {
          console.error(url, err);
        }
        if(res != null) {
          if (res.error) {
            console.error(url, res.status, res.error.toString());
            reject(Error(res.error.toString()));
          } else {
            resolve(res['body']);
          }
        }
        resolve(null);
      })
  });
}

function processLocalesStatistic(serverResponse) {
  _state['locales'] = {};
  _state['localeOptions'] = [];
  _state['srcLocale'] = serverResponse['srcLocale'];
  resetCache();

  _.forEach(serverResponse['transLocale'], function(transLocale) {
    _state['locales'][transLocale.locale.localeId] = transLocale;
    _state['localeOptions'].push({
      value: transLocale.locale.localeId,
      label: `${transLocale.locale.displayName} - (${transLocale.numberOfTerms})`
    });
  });
  return _state;
}

function glossaryAPIUrl(srcLocaleId, transLocale) {
  var page = _state['page'], filter = _state['filter'];

  var url = Configs.baseUrl + "/glossary/src/" + srcLocaleId;

  if(!StringUtils.isEmptyOrNull(transLocale)) {
    url = url + "/trans/" + transLocale;
  }
  url = url + Configs.urlPostfix + "?page=" + page + "&sizePerPage=" + SIZE_PER_PAGE;

  if(!StringUtils.isEmptyOrNull(filter)) {
    url = url + "&filter=" + filter;
  }
  return url + generateSortOrderParam();
}


function generateSortOrderParam() {
  var params = [];
  _.forOwn(_state['sort'], function (value, field) {
    var param = value === true ? field : "-" + field;
    params.push(param);
  });

  return _.size(params) > 0 ? "&sort=" + params.join() : '';
}

function loadGlossaryByLocale () {
  var srcLocale = _state['srcLocale'],
    selectedTransLocaleId = _state['selectedTransLocale'];

  if(!_.isUndefined(srcLocale) && !_.isNull(srcLocale)) {
    var url = glossaryAPIUrl(srcLocale.locale.localeId, selectedTransLocaleId);

    return new Promise(function(resolve, reject) {
      Request.get(url)
        .set("Cache-Control", "no-cache, no-store, must-revalidate")
        .set('Accept', 'application/json')
        .set("Pragma", "no-cache")
        .set("Expires", 0)
        .end(function (err, res) {
          if(err != null && err.error === true) {
            console.error(url, err);
          }
          if(res != null) {
            if (res.error) {
              console.error(url, res.status, res.error.toString());
              reject(Error(res.error.toString()));
            } else {
              resolve(res['body']);
            }
          }
          resolve(null);
        });
    });
  }
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
  var transLocaleId = _state['selectedTransLocale'],
    page = _state['page'];

  _state['totalCount'] = serverResponse.totalCount;

  var startIndex = ((_state['page'] -1) * SIZE_PER_PAGE);

  for (var i = startIndex; i < _state['totalCount']; i++) {
    _state['glossaryResId'].push(null);
  }

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
      if(_.isUndefined(transTerm['comment'])) {
        transTerm['comment'] = ''
      }
    } else {
      transTerm = GlossaryHelper.generateTerm(transLocaleId);
    }
    _state['glossary'][entry.resId] = {
      resId: entry.resId,
      pos: _.isUndefined(entry.pos) ? '' : entry.pos,
      description: _.isUndefined(entry.description) ? '' : entry.description,
      termsCount: entry.termsCount,
      srcTerm: srcTerm,
      transTerm: transTerm,
      status: GlossaryHelper.getDefaultEntryStatus()
    };
    _state['glossary'][entry.resId].status['isSrcValid'] = GlossaryHelper.isSourceValid( _state['glossary'][entry.resId]);
    _state['glossary'][entry.resId].status['canUpdateTransComment'] = GlossaryHelper.canUpdateTransComment( _state['glossary'][entry.resId]);
    _state['glossaryResId'][startIndex] = [entry.resId];
    startIndex+=1;
  });
  _state['original_glossary'] = _.cloneDeep(_state['glossary']);
  return _state;
}

/**
 * data: {
 *  resId: term resId
 *  srcLocale: source locale id
 * }
 * @param data
 */
function deleteGlossary(data) {
  var url = Configs.baseUrl + "/glossary/entries/" + data.resId + Configs.urlPostfix;

  return new Promise(function(resolve, reject) {
    Request.del(url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if(err != null && err.error === true) {
          console.error(url, err);
        }
        if(res != null) {
          if (res.error) {
            console.error(url, res.status, res.error.toString());
            reject(Error(res.error.toString()));
          } else {
            resolve(res['body']);
          }
        }
        resolve(null);
      })
  });
}
function saveGlossary(data) {
  var entry = {
    resId: '', pos: data.pos, description: data.description,
    srcTerm: GlossaryHelper.generateSrcTerm(data.srcLocaleId)
  };
  entry.srcTerm.content = data.term;
  var glossary = GlossaryHelper.generateGlossaryDTO(entry);
  return saveOrUpdateGlossary(glossary);
}

function updateGlossary(entry) {
  entry.status.isSaving = true;
  var glossary = GlossaryHelper.generateGlossaryDTO(entry);
  return saveOrUpdateGlossary(glossary);
}

function saveOrUpdateGlossary(glossary) {
  var url = Configs.baseUrl + "/glossary/" + Configs.urlPostfix;
  return new Promise(function(resolve, reject) {
    Request.post(url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(glossary)
      .end(function (err, res) {
        if(err != null && err.error === true) {
          console.error(url, err);
        }
        if(res != null) {
          if (res.error) {
            console.error(url, res.status, res.error.toString());
            reject(Error(res.error.toString()));
          } else {
            resolve(res['body']);
          }
        }
        resolve(null);
      })
  });
}

function uploadFile(data) {
  var url = Configs.baseUrl + "/glossary/upload",
    uploadFile = data.uploadFile;

  _state['uploadFile']['status'] = 0;

  return new Promise(function(resolve, reject) {
    Request.post(url)
      .attach('file', uploadFile.file, uploadFile.file.name)
      .field('fileName', uploadFile.file.name)
      .field('srcLocale', data.srcLocale)
      .field('transLocale', data.uploadFile.transLocale)
      .set('Accept', 'application/json')
      .end(function (err, res) {
        _state['uploadFile']['status'] = -1;
        _state['uploadFile'].show = false;
        _state['uploadFile'].transLocale = null;
        _state['uploadFile'].file = null;

        if(err != null && err.error === true) {
          console.error(url, err);
        }
        if(res != null) {
          if (res.error) {
            console.error(url, res.status, res.error.toString());
            reject(Error(res.error.toString()));
          } else {
            resolve(res['body']);
          }
        }
        resolve(null);
      })
      .on('progress', function(e) {
        _state['uploadFile']['status'] = e.percent;
      });
  });
}

function processDelete(serverResponse) {
  console.debug('Glossary entry deleted');
}

function processSave(serverResponse) {
  _state['newEntry'].isSaving = false;
  _state['newEntry'].show = false;
  _state['newEntry'].isAllowSave = false;
  _state['newEntry'].pos = '';
  _state['newEntry'].term = '';
  _state['newEntry'].description = '';

  console.debug('Glossary entry saved');
}

function processUpdate(serverResponse) {
  console.debug('Glossary entry updated');
}

function initialise() {
  //load permission here
  _state['canAddNewEntry'] = canAddNewEntry();
  _state['canUpdateEntry'] = canUpdateEntry();

  loadLocalesStats()
    .then(processLocalesStatistic)
    .then(loadGlossaryByLocale)
    .then(processGlossaryList)
    .then(function (newState) {
      GlossaryStore.emitChange();
    });
}

var GlossaryStore = assign({}, EventEmitter.prototype, {
  init: function() {
    if (_state.locales === null) {
      initialise();
    }
    return _state;
  }.bind(this),

  getEntry: function(resId) {
    return _state['glossary'][resId];
  },

  getFocusedRow: function() {
    return _state['focusedRow'];
  },

  getNewEntryState: function() {
    return _state['newEntry'];
  },

  getUploadFileState: function() {
    return _state['uploadFile'];
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
    var action = payload.action;
    switch (action['actionType']) {
      case GlossaryActionTypes.TRANS_LOCALE_SELECTED:
        console.debug('select language', action.data);
        _state['selectedTransLocale'] = action.data;
        resetCache();
        loadGlossaryByLocale()
          .then(processGlossaryList)
          .then(function (newState) {
            GlossaryStore.emitChange();
          });
        break;
      case GlossaryActionTypes.INSERT_GLOSSARY:
        console.debug('save glossary', action.data);
        _state['newEntry'].isSaving = true;
        _state['newEntry'].show = true;
        GlossaryStore.emitChange();

        saveGlossary(action.data)
          .then(processSave)
          .then(initialise);
        break;
      case GlossaryActionTypes.UPDATE_GLOSSARY:
        console.debug('update glossary', _state['glossary'][action.data]);
        updateGlossary(_state['glossary'][action.data])
          .then(processUpdate)
          .then(initialise);
        break;
      case GlossaryActionTypes.DELETE_GLOSSARY:
        console.debug('delete entry', action.data);
        deleteGlossary(action.data)
          .then(processDelete)
          .then(initialise);
        break;
      case GlossaryActionTypes.UPDATE_FILTER:
        console.debug('Update filter', action.data);
        if(_state['filter']  !== action.data) {
          _state['filter'] = action.data;
          initialise();
        }
        break;
      case GlossaryActionTypes.LOAD_GLOSSARY:
        console.debug('load glossary', action.data);
        _state['page'] = Math.ceil(action.data/(SIZE_PER_PAGE - 1));
        _state['page'] = _state['page'] < 1 ? 1 : _state['page'];
        loadGlossaryByLocale()
          .then(processGlossaryList)
          .then(function (newState) {
            GlossaryStore.emitChange();
          });
        break;
       case GlossaryActionTypes.UPDATE_SORT_ORDER:
         console.debug('Update sort order', action.data);
         _state['sort'][action.data.field] = action.data.ascending;
         loadGlossaryByLocale()
           .then(processGlossaryList)
           .then(function (newState) {
             GlossaryStore.emitChange();
           });
         break;
      case GlossaryActionTypes.UPLOAD_FILE:
        console.debug('Upload file', action.data);
        uploadFile(action.data)
          .then(resetCache)
          .then(loadGlossaryByLocale)
          .then(processGlossaryList)
          .then(function (newState) {
            GlossaryStore.emitChange();
          });
        break;
      case GlossaryActionTypes.UPDATE_ENTRY_FIELD:
        _.set(_state['glossary'][action.data.resId], action.data.field, action.data.value);
        _state['glossary'][action.data.resId]['status'] =
          GlossaryHelper.getEntryStatus(_state['glossary'][action.data.resId], _state['original_glossary'][action.data.resId]);
        GlossaryStore.emitChange();
        break;
      case GlossaryActionTypes.UPDATE_COMMENT:
        console.debug('Update comment', action.data);
        _.set(_state['glossary'][action.data.resId], 'transTerm.comment', action.data.value);
        saveOrUpdateGlossary(_state['glossary'][action.data.resId])
          .then(processSave)
          .then(initialise);
        break;
      case GlossaryActionTypes.UPDATE_FOCUSED_ROW:
        var previousResId = _state['focusedRow'] ? _state['focusedRow'].resId : null;
        var entry = _state['glossary'][previousResId];
        if(entry && (entry.status.isSrcModified || entry.status.isTransModified)) {
          saveOrUpdateGlossary(entry)
              .then(processSave)
              .then(initialise);
        }
        _state['focusedRow'] = action.data;
        GlossaryStore.emitChange();
        break;
      case GlossaryActionTypes.RESET_ENTRY:
        console.debug('reset entry', action.data);
        _state['glossary'][action.data] = _state['original_glossary'][action.data];
        GlossaryStore.emitChange();
        break;
    }
  })
});

function resetCache() {
  _state['page'] = 1;
  _state['glossary'] = {};
  _state['glossaryResId'] = [];
  _state['sort'] = {
    src_content: true
  };
}

export default GlossaryStore;
