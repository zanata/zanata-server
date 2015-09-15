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

var SIZE_PER_PAGE = 5000;

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
  uploadFile: null,
  sort: {
    src_content: true
  },
  totalCount: 0,
  loading: false
};

var CHANGE_EVENT = "change";

function localesStatAPIUrl() {
  return Configs.baseUrl + "/glossary/locales/list" + Configs.urlPostfix
}

function loadLocalesStats() {
  var url = localesStatAPIUrl();

  return new Promise(function(resolve, reject) {
    Request.get(url)
      .set("Cache-Control", "no-cache, no-store, must-revalidate")
      .set('Accept', 'application/json')
      .set("Pragma", "no-cache")
      .set("Expires", 0)
      .end((function (res) {
        if (res.error) {
          console.error(url, res.status, res.error.toString());
          reject(Error(res.error.toString()));
        } else {
          resolve(res['body']);
        }
      }));
  });
}

function processLocalesStatistic(serverResponse) {
  _state['locales'] = {};
  _state['localeOptions'] = [];
  _state['srcLocale'] = serverResponse['srcLocale'];
  resetCache(_state['srcLocale'].count);

  _.forEach(serverResponse['transLocale'], function(transLocale) {
    _state['locales'][transLocale.locale.localeId] = transLocale;
    _state['localeOptions'].push({
      value: transLocale.locale.localeId,
      label: transLocale.locale.displayName + " - (" + transLocale.count + ")"
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
        .end((function (res) {
          if (res.error) {
            console.error(url, res.status, res.error.toString());
            reject(Error(res.error.toString()));
          } else {
            resolve(res['body']);
          }
        }));
    });
  }
}

function canAddNewEntry () {
 return Configs.data.permission.insertGlossary;
}

function canUpdateEntry() {
  return Configs.data.permission.updateGlossary;
}

function generateTerm(transLocaleId) {
  return {
    content: '',
    locale: transLocaleId,
    comment: '',
    lastModifiedDate: '',
    lastModifiedBy: ''
  }
}
function generateSrcTerm(localeId) {
  var term = generateTerm(localeId);
  term['reference'] = '';
  return term;
}

function processGlossaryList(serverResponse) {
  var transLocaleId = _state['selectedTransLocale'],
  srcLocaleId = _state['srcLocale'].locale.localeId,
    page = _state['page'];

  _state['totalCount'] = serverResponse.totalCount;

  var startIndex = ((_state['page'] -1) * SIZE_PER_PAGE);

  for (var i = startIndex; i < _state['totalCount']; i++) {
    _state['glossaryResId'].push(null);
  }

  if(StringUtils.isEmptyOrNull(transLocaleId) && _state['canAddNewEntry']) {
    var newEntryKey = 'NEW_ENTRY';
    startIndex +=1;
    if(_.isUndefined(_state['glossary'][newEntryKey])) {
      _state['glossary'][newEntryKey] = {
        resId: '', pos: '', description: '',
        srcTerm: generateSrcTerm(srcLocaleId),
        transTerm: generateTerm(transLocaleId),
        modified: {
          source: false,
          trans: false
        }
      };
      _state['glossaryResId'][0] = [newEntryKey];
    }
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
    } else {
      transTerm = generateTerm(transLocaleId);
    }
    _state['glossary'][entry.resId] = {
      resId: entry.resId,
      pos: _.isUndefined(entry.pos) ? '' : entry.pos,
      description: _.isUndefined(entry.description) ? '' : entry.description,
      termsCount: entry.termsCount,
      srcTerm: srcTerm,
      transTerm: transTerm,
      modified: {
        source: false,
        trans: false
      }
    };
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
  var url = Configs.baseUrl + "/glossary/" + data.srcLocale + "/" + data.resId + Configs.urlPostfix;

  return new Promise(function(resolve, reject) {
    Request.del(url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end((function (res) {
        if (res.error) {
          console.error(url, res.status, res.error.toString());
          reject(Error(res.error.toString()));
        } else {
          resolve(res['body']);
        }
      }));
  });
}

function saveOrUpdateGlossary(data) {
  //create glossary object from data
  var url = Configs.baseUrl + "/glossary/" + Configs.urlPostfix,
    glossary = GlossaryHelper.generateGlossaryDTO(data);

  return new Promise(function(resolve, reject) {
    Request.post(url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(glossary)
      .end((function (res) {
        if (res.error) {
          console.error(url, res.status, res.error.toString());
          reject(Error(res.error.toString()));
        } else {
          resolve(res['body']);
        }
      }));
  });
}

function uploadFile(data) {
  var url = Configs.baseUrl + "/glossary/src/" + data.srcLocale + "/trans/" + data.transLocale + "/upload",
    uploadFile = data.uploadFile;

  return new Promise(function(resolve, reject) {
    Request.post(url)
      .attach('file', uploadFile.file, uploadFile.file.name)
      .set('Accept', 'application/json')
      .end((function (res) {
        if (res.error) {
          console.error(url, res.status, res.error.toString());
          reject(Error(res.error.toString()));
        } else {
          resolve(res['body']);
        }
      }));
  });
}

function processDelete(serverResponse) {
  console.info('Glossary entry deleted', serverResponse);
}

function processSave(serverResponse) {
  console.info('Glossary entry saved', serverResponse);
}

function initialise () {
  //load permission here
  _state['canAddNewEntry'] = canAddNewEntry();
  _state['canUpdateEntry'] = canUpdateEntry();

  loadLocalesStats()
    .then(processLocalesStatistic)
    .then(function (newState) {
      GlossaryStore.emitChange();
    })
    .then(function() {
      loadGlossaryByLocale()
        .then(processGlossaryList)
        .then(function (newState) {
          GlossaryStore.emitChange();
        });
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
        _state['selectedTransLocale'] = action.data;
        resetCache();
        loadGlossaryByLocale()
          .then(processGlossaryList)
          .then(function (newState) {
            GlossaryStore.emitChange();
          });
        break;
      case GlossaryActionTypes.INSERT_GLOSSARY:
      case GlossaryActionTypes.UPDATE_GLOSSARY:
        saveOrUpdateGlossary(_state['glossary'][action.data])
          .then(processSave)
          .then(function () {
            initialise();
          });
        break;
      case GlossaryActionTypes.DELETE_GLOSSARY:
        //glossary resId with srcLocale
        deleteGlossary(action.data)
          .then(processDelete)
          .then(function () {
            resetCache();
            initialise();
          });
        break;
      case GlossaryActionTypes.UPDATE_FILTER:
        if(_state['filter']  !== action.data) {
          _state['filter'] = action.data;
          resetCache();
          initialise();
        }
        break;
      case GlossaryActionTypes.LOAD_GLOSSARY:
        _state['page'] = Math.ceil(action.data/(SIZE_PER_PAGE - 1));
        _state['page'] = _state['page'] < 1 ? 1 : _state['page'];
        loadGlossaryByLocale()
          .then(processGlossaryList)
          .then(function (newState) {
            GlossaryStore.emitChange();
          });
        break;
       case GlossaryActionTypes.UPDATE_SORT_ORDER:
         _state['sort'][action.data.field] = action.data.ascending;
         loadGlossaryByLocale()
           .then(processGlossaryList)
           .then(function (newState) {
             GlossaryStore.emitChange();
           });
         break;
      case GlossaryActionTypes.UPLOAD_FILE:
        uploadFile(action.data).then(function () {
          resetCache();
          loadGlossaryByLocale()
            .then(processGlossaryList)
            .then(function (newState) {
              GlossaryStore.emitChange();
            })
        });
        break;
      case GlossaryActionTypes.UPDATE_ENTRY_FIELD:
        _.set(_state['glossary'][action.data.resId], action.data.field, action.data.value);
        _state['glossary'][action.data.resId]['modified'] =
          GlossaryHelper.compare(_state['glossary'][action.data.resId], _state['original_glossary'][action.data.resId]);
        GlossaryStore.emitChange();
        break;
    }
  })
});

function resetCache(totalCount) {
  _state['page'] = 1;
  _state['glossary'] = {};
  _state['glossaryResId'] = [];
}

export default GlossaryStore;
