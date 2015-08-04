import Dispatcher from '../dispatchers/GlossaryDispatcher';
import assign from 'object-assign';
import {EventEmitter} from 'events';
import {Promise} from 'es6-promise';
import Request from 'superagent';
import Configs from '../constants/Configs';
import {GlossaryActionTypes} from '../constants/ActionTypes';
import _ from 'lodash';

var _state = {
  localeOptions: [],
  selectedLocale: null,
  localesStats: null,
  glossary: {}
};

var CHANGE_EVENT = "change";

function localesStatisticAPIUrl() {
  return Configs.baseUrl + "/glossary/locales/list" + Configs.urlPostfix
}

function loadLocalesStats() {
  var url = localesStatisticAPIUrl();

  return new Promise(function(resolve, reject) {
    Request.get(url)
      .set("Cache-Control", "no-cache, no-store, must-revalidate")
      .set("Pragma", "no-cache")
      .set("Expires", 0)
      .end((function (res) {
        //console.log('response:' + res.body);
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
  var localeStatsMap = {}, options = [];
  _.forEach(serverResponse, function(stats) {
    localeStatsMap[stats.locale.localeId] = stats;
    options.push(stats.locale.displayName);
  });
  _state['selectedLocale'] = options[0];
  _state['localeOptions'] = options;
  _state['localesStats'] = localeStatsMap;
  return _state;
}

function glossaryAPIUrl(localeId) {
  return Configs.baseUrl + "/glossary/" + localeId + Configs.urlPostfix
}

function loadGlossaryByLocale() {
  var selectedLocaleId = getLocaleIdByDisplayName(_state['localesStats'], _state['selectedLocale']),
    url = glossaryAPIUrl(selectedLocaleId);

  return new Promise(function(resolve, reject) {
    Request.get(url)
      .set("Cache-Control", "no-cache, no-store, must-revalidate")
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

function processGlossaryList(serverResponse) {
  _state['glossary'] = serverResponse;
  return _state;
}

function getLocaleIdByDisplayName(localeList, displayName) {
  var localeId = _(localeList)
    .filter(function(locale) { return locale.locale.displayName === displayName; })
    .pluck('locale.localeId')
    .value();
  return localeId[0];
}

var GlossaryStore = assign({}, EventEmitter.prototype, {
  getLocaleStats: function() {
    if (_state.localesStats === null) {
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
    return _state;
  }.bind(this),

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
      case GlossaryActionTypes.LOCALE_SELECTED:
        console.log('locale from %s -> %s', _state['selectedLocale'], action.data);
        _state['selectedLocale'] = action.data;
        loadGlossaryByLocale()
          .then(processGlossaryList)
          .then(function (newState) {
            GlossaryStore.emitChange();
          });
        break;
    }
  })
});

export default GlossaryStore;