(function() {
  'use strict';

  /**
   * Root application
   * app.js
   */
  angular.module(
    'app', [
      'ngResource',
      'ngAnimate',
      'ui.router',
      'templates',
      'cfp.hotkeys',
      'focusOn',
      'monospaced.elastic',
      'gettext',
      'diff-match-patch'
    ]);

})();

(function() {
  'use strict';

  /**
   * @name AppConfig
   * @description Main config for the entire app
   * @ngInject
   */
  function AppConfig($stateProvider, $urlRouterProvider, $httpProvider,
    hotkeysProvider) {

    //Can't use injection for EventService as this module is out of the scope
    var interceptor = function($q, $rootScope) {
      return {
        request: function(config) {
          // See EventService.EVENT.LOADING_START
          $rootScope.$broadcast('loadingStart');
          return config;
        },
        requestError: function(rejection) {
          // See EventService.EVENT.LOADING_STOP
          $rootScope.$broadcast('loadingStop');
          console.error('Request error due to ', rejection);
          return $q.reject(rejection);
        },
        response: function(response) {
          // See EventService.EVENT.LOADING_STOP
          $rootScope.$broadcast('loadingStop');
          return response || $q.when(response);
        },
        responseError: function(rejection) {
          // See EventService.EVENT.LOADING_STOP
          $rootScope.$broadcast('loadingStop');
          if (rejection.status === 401) {
            console.error('Unauthorized access. Please login');
          } else if (rejection.status === 404) {
            console.error('Service end point not found- ',
              rejection.config.url);
          } else {
            console.error('Error in response ', rejection);
          }
          return $q.reject(rejection);
        }
      };
    };
    interceptor.$inject = ["$q", "$rootScope"];

    $httpProvider.interceptors.push(interceptor);

    // For any unmatched url, redirect to /editor
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('editor', {
        url: '/:projectSlug/:versionSlug/translate',
        templateUrl: 'editor/editor.html',
        controller: 'EditorCtrl as editor',
        resolve: {
          url : ["UrlService", function(UrlService) {
            return UrlService.init();
          }]
        }
      }).state('editor.selectedContext', {
        url: '/:docId/:localeId',
        views: {
          'editor-content': {
            templateUrl: 'editor/editor-content.html',
            controller: 'EditorContentCtrl as editorContent'
          },
          'editor-suggestions': {
            templateUrl: 'editor/editor-suggestions.html',
            controller: 'EditorSuggestionsCtrl as editorSuggestions'
          },
          'editor-details': {
            templateUrl: 'editor/editor-details.html',
            controller: 'EditorDetailsCtrl as editorDetails'
          }
        }
      }).state('editor.selectedContext.tu', {
        url: '/?id&selected?states',
        reloadOnSearch: false
      });

      hotkeysProvider.includeCheatSheet = false;

  //   $locationProvider.html5Mode(true);
  //     .hashPrefix('!');
  }
  AppConfig.$inject = ["$stateProvider", "$urlRouterProvider", "$httpProvider", "hotkeysProvider"];

  angular
    .module('app')
    .config(AppConfig);

})();




(function() {
  'use strict';

  /**
   * AddConstants
   * "Global" app variables. Don't worry David, they're not really global.
   */
  angular
    .module('app')
    .constant('_', window._)
    .constant('str', window._.string)
    .constant('Mousetrap', window.Mousetrap)
    // Toggle to hide/show features that are ready for production
    .constant('PRODUCTION', true);

})();



(function() {
  'use strict';

  /**
   * @name AppCtrl
   * @description Main controler for the entire app
   * @ngInject
   */
  function AppCtrl($scope, UserService, UrlService, LocaleService,
                   MessageHandler, gettextCatalog, StringUtil, PRODUCTION) {
    var appCtrl = this;

    // See AppConstants.js
    appCtrl.PRODUCTION = PRODUCTION;
    appCtrl.settings = UserService.settings;
    appCtrl.uiLocaleList = [ LocaleService.DEFAULT_LOCALE ];

    /*
      Not used for the time being. But should show loading when change state
      $scope.$on('$stateChangeStart', function(event, toState) {
        if (toState.resolve) {
        }
      });

      $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.resolve) {
        }
      });
    */

    UrlService.init().then(loadLocales).
      then(loadUserInformation).
      then(loadUILocale);

    // On UI locale changes listener
    appCtrl.onChangeUILocale = function(locale) {
      appCtrl.myInfo.locale = locale;
      var uiLocaleId = appCtrl.myInfo.locale.localeId;
      if (!StringUtil.startsWith(uiLocaleId,
        LocaleService.DEFAULT_LOCALE.localeId, true)) {
        gettextCatalog.loadRemote(UrlService.uiTranslationURL(uiLocaleId))
            .then(
                function() {
                  gettextCatalog.setCurrentLanguage(uiLocaleId);
                },
                function(error) {
                  MessageHandler.displayInfo('Error loading UI locale. ' +
                    'Default to \'' + LocaleService.DEFAULT_LOCALE.name +
                    '\': ' + error);
                  gettextCatalog.setCurrentLanguage(
                    LocaleService.DEFAULT_LOCALE);
                  appCtrl.myInfo.locale = LocaleService.DEFAULT_LOCALE;
                });
      } else {
        gettextCatalog.setCurrentLanguage(
          LocaleService.DEFAULT_LOCALE.localeId);
      }
    };

    appCtrl.dashboardPage = function() {
      return UrlService.DASHBOARD_PAGE;
    };

    function loadLocales() {
      return LocaleService.getAllLocales();
    }

    function loadUserInformation() {
      return UserService.getMyInfo().then(
        function(myInfo) {
          appCtrl.myInfo = myInfo;
          appCtrl.myInfo.locale = LocaleService.DEFAULT_LOCALE;
          appCtrl.myInfo.gravatarUrl = UrlService.gravatarUrl(
            appCtrl.myInfo.gravatarHash, 72);
        }, function(error) {
          MessageHandler.displayError('Error loading my info: ' + error);
        });
    }

    function loadUILocale() {
      LocaleService.getUILocaleList().then(
        function(translationList) {
          for ( var i in translationList.locales) {
            var language = {
              'localeId' : translationList.locales[i],
              'name' : ''
            };
            appCtrl.uiLocaleList.push(language);
          }
          appCtrl.myInfo.locale = LocaleService.getLocaleByLocaleId(
            appCtrl.uiLocaleList, LocaleService.DEFAULT_LOCALE.localeId);
          if (!appCtrl.myInfo.locale) {
            appCtrl.myInfo.locale = LocaleService.DEFAULT_LOCALE;
          }
        },
        function(error) {
          MessageHandler.displayInfo('Error loading UI locale. ' +
            'Default to \'' + LocaleService.DEFAULT_LOCALE.name +
            '\': ' + error);
          appCtrl.myInfo.locale = LocaleService.DEFAULT_LOCALE;
        });
    }
  }
  AppCtrl.$inject = ["$scope", "UserService", "UrlService", "LocaleService", "MessageHandler", "gettextCatalog", "StringUtil", "PRODUCTION"];

  angular
    .module('app')
    .controller('AppCtrl', AppCtrl);

})();




(function() {
  'use strict';

  /**
   * EditorContentCtrl.js
   * @ngInject
   */
  function EditorContentCtrl($rootScope, EditorService, PhraseService,
                             DocumentService, UrlService, EventService,
                             $stateParams, PhraseUtil, $location, _,
                             TransStatusService) {

    //TODO: move pager to directives/convert to infinite scroll
    var COUNT_PER_PAGE = 50,
        editorContentCtrl = this, status, filter;
    refreshFilterQueryFromUrl();

    editorContentCtrl.phrases = [];

    EditorService.updateContext($stateParams.projectSlug,
      $stateParams.versionSlug, DocumentService.decodeDocId($stateParams.docId),
      $stateParams.localeId);

    init();

    $rootScope.$on(EventService.EVENT.FILTER_TRANS_UNIT,
      function (event, filter) {
        if(filter.status.all === true) {
          $location.search('status', null);
        } else {
          var queries = [];
          _.forEach(filter.status, function(val, key) {
            if(val) {
              queries.push(key);
            }
          });
          $location.search('status', queries.join(','));
        }
        refreshFilterQueryFromUrl();
        init();
      });

    function refreshFilterQueryFromUrl() {
      status = UrlService.readValue('status');

      if(!_.isUndefined(status)) {
        status = status.split(',');
        status = _.transform(status, function(result, state) {
          state = TransStatusService.getServerId(state);
          return result.push(state);
        });
      }
      filter = {
        'status': status
      };
    }


    $rootScope.$on(EventService.EVENT.GOTO_FIRST_PAGE,
      function () {
        if(EditorService.currentPageIndex > 0) {
          EditorService.currentPageIndex = 0;
          changePage(EditorService.currentPageIndex);
        }
      });

    $rootScope.$on(EventService.EVENT.GOTO_PREV_PAGE,
      function () {
        if(EditorService.currentPageIndex > 0) {
          EditorService.currentPageIndex -= 1;
          changePage(EditorService.currentPageIndex);
        }
      });

    $rootScope.$on(EventService.EVENT.GOTO_NEXT_PAGE,
      function () {
        if(EditorService.currentPageIndex < EditorService.maxPageIndex) {
          EditorService.currentPageIndex +=1;
          changePage(EditorService.currentPageIndex);
        }
      });

    $rootScope.$on(EventService.EVENT.GOTO_LAST_PAGE,
      function () {
        if(EditorService.currentPageIndex < EditorService.maxPageIndex) {
          EditorService.currentPageIndex = EditorService.maxPageIndex;
          changePage(EditorService.currentPageIndex);
        }
      });

    /*
      TODO: after moving to infinite scroll, all these go to event handler
      should move back to TransUnitService and use PhraseService.findNextId etc
     */
    // EventService.EVENT.GOTO_NEXT_ROW listener
    $rootScope.$on(EventService.EVENT.GOTO_NEXT_ROW, goToNextRow);

    // EventService.EVENT.GOTO_PREVIOUS_ROW listener
    $rootScope.$on(EventService.EVENT.GOTO_PREVIOUS_ROW, goToPreviousRow);

    // EventService.EVENT.GOTO_NEXT_UNTRANSLATED listener
    $rootScope.$on(EventService.EVENT.GOTO_NEXT_UNTRANSLATED,
                   goToNextUntranslated);

    function goToNextRow(event, data) {
      var phrases = editorContentCtrl.phrases,
        phrase,
        currentIndex,
        nextIndex,
        nextId;

      currentIndex = _.findIndex(phrases, function (phrase) {
        return phrase.id === data.currentId;
      });
      nextIndex = Math.min(currentIndex + 1, phrases.length - 1);
      nextId = phrases[nextIndex].id;

      if (nextId !== data.currentId) {
        EventService.emitEvent(EventService.EVENT.SELECT_TRANS_UNIT,
                               {
                                 'id': nextId,
                                 'updateURL': true,
                                 'focus': true
                               }, null);
      } else {
        // we have reach the end
        phrase = phrases[currentIndex];
        EventService.emitEvent(EventService.EVENT.SAVE_TRANSLATION,
           {
             'phrase': phrase,
             'status': PhraseUtil.getSaveButtonStatus(phrase),
             'locale': $stateParams.localeId,
             'docId': $stateParams.docId
           });
      }
    }

    function goToPreviousRow(event, data) {
      var phrases = editorContentCtrl.phrases,
        phrase,
        currentIndex,
        previousIndex,
        prevId;

      currentIndex = _.findIndex(phrases, function (phrase) {
        return phrase.id === data.currentId;
      });
      previousIndex = Math.max(currentIndex - 1, 0);
      prevId = phrases[previousIndex].id;

      if (prevId !== data.currentId) {
        EventService.emitEvent(EventService.EVENT.SELECT_TRANS_UNIT,
                               {
                                 'id': prevId,
                                 'updateURL': true,
                                 'focus': true
                               }, null);
      } else {
        phrase = phrases[currentIndex];
        // have reach the start
        EventService.emitEvent(EventService.EVENT.SAVE_TRANSLATION,
           {
             'phrase': phrase,
             'status': PhraseUtil.getSaveButtonStatus(phrase),
             'locale': $stateParams.localeId,
             'docId': $stateParams.docId
           });
      }
    }

    function goToNextUntranslated(event, data) {
      var phrases = editorContentCtrl.phrases,
        requestStatus = TransStatusService.getStatusInfo(status),
        currentIndex,
        nextStatusInfo;

      currentIndex = _.findIndex(phrases, function (phrase) {
        return phrase.id === data.currentId;
      });

      for (var i = currentIndex + 1; i < phrases.length; i++) {
        nextStatusInfo = TransStatusService.getStatusInfo(
          phrases[i].state);
        if (nextStatusInfo.ID === requestStatus.ID) {
          EventService.emitEvent(EventService.EVENT.SELECT_TRANS_UNIT,
                                 {
                                   'id': phrases[i].id,
                                   'updateURL': true,
                                   'focus': true
                                 }, null);
          return;
        }
      }
      // can not find next untranslated
      //TransUnitService.saveCurrentRowIfModifiedAndUnfocus(data);
    }

    function changePage(pageIndex) {
      loadPhrase(pageIndex);
      EventService.emitEvent(EventService.EVENT.CANCEL_EDIT);
    }

    /**
     * Load transUnit
     *
     * @param projectSlug
     * @param versionSlug
     * @param docId
     * @param localeId
     */
    function init() {
      EventService.emitEvent(EventService.EVENT.REFRESH_STATISTIC,
        {
          projectSlug: EditorService.context.projectSlug,
          versionSlug: EditorService.context.versionSlug,
          docId: EditorService.context.docId,
          localeId: EditorService.context.localeId
        }
      );

      PhraseService.getPhraseCount(EditorService.context, filter).
        then(function(count) {
          EditorService.maxPageIndex = parseInt(count / COUNT_PER_PAGE);
          if(count > COUNT_PER_PAGE) {
            EditorService.maxPageIndex = count % COUNT_PER_PAGE !== 0 ?
              EditorService.maxPageIndex +=1 : EditorService.maxPageIndex;
          }

          EditorService.maxPageIndex =  EditorService.maxPageIndex -1 < 0 ? 0 :
            EditorService.maxPageIndex -1;

          loadPhrase(EditorService.currentPageIndex);
      });
    }

    function loadPhrase(pageIndex) {
      var startIndex = pageIndex * COUNT_PER_PAGE;
      PhraseService.fetchAllPhrase(EditorService.context, filter,
        startIndex, COUNT_PER_PAGE).then(displayPhrases);
    }

    function displayPhrases(phrases) {
      editorContentCtrl.phrases = phrases;
    }

    return editorContentCtrl;
  }
  EditorContentCtrl.$inject = ["$rootScope", "EditorService", "PhraseService", "DocumentService", "UrlService", "EventService", "$stateParams", "PhraseUtil", "$location", "_", "TransStatusService"];

  angular
    .module('app')
    .controller('EditorContentCtrl', EditorContentCtrl);
})();

(function() {
  'use strict';

  /**
   * EditorCtrl.js
   * @ngInject
   */
  function EditorCtrl($scope, UserService, DocumentService, LocaleService,
    ProjectService, EditorService, SettingsService, StatisticUtil,
    UrlService, $stateParams, $state, MessageHandler, $rootScope,
    EventService, EditorShortcuts, _, Mousetrap) {
    var editorCtrl = this;
    editorCtrl.pageNumber = 1;
    editorCtrl.showCheatsheet = false;
    editorCtrl.shortcuts = _.mapValues(
      _.values(EditorShortcuts.SHORTCUTS), function(shortcutInfo) {
        // second combo (secondary keys) is an array. We have to flatten it
        var keyCombos = _.flatten(shortcutInfo.keyCombos, 'combo');
        return {
        combos: _.map(keyCombos, function(key) {
          return EditorShortcuts.symbolizeKey(key);
        }),
        description: shortcutInfo.keyCombos[0].description
      };
    });

    //tu status to include for display
    editorCtrl.filter = {
      'status' : {
        'all': true,
        'approved' : false,
        'translated' : false,
        'needsWork': false,
        'untranslated': false
      }
    };

    processFilterQuery();

    //This is just processing UI during startup,
    //phrase filtering are done in EditorContentCtrl during init
    function processFilterQuery() {
      //process filter query
      var status = UrlService.readValue('status');

      if(!_.isUndefined(status)) {
        status = status.split(',');
        _.forEach(status, function(val) {
          if(!_.isUndefined(editorCtrl.filter.status[val])) {
            editorCtrl.filter.status[val] = true;
          }
        });
        updateFilter();
      }
    }

    Mousetrap.bind('?', function(event) {
      var srcElement = event.srcElement;
      if (!editorCtrl.showCheatsheet && !stopCheatsheetCallback(srcElement)) {
        editorCtrl.toggleKeyboardShortcutsModal();
        $scope.$digest();
      }
    }, 'keyup');

    /**
     * Mousetrap by default stops callback on input elements BUT
     * hotkeys monkey patched it!!!
     * TODO change this hack once we remove angular hotkeys
     */
    function stopCheatsheetCallback(element) {
      // if the element has the class "mousetrap" then no need to stop
      if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
        return false;
      }

      // stop for input, select, and textarea
      return element.tagName === 'INPUT' || element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA' || element.isContentEditable;
    }

    //TODO: cross domain rest
    //TODO: Unit test

    //Working URL: http://localhost:8000/#/tiny-project/1/translate or
    // http://localhost:8000/#/tiny-project/1/translate/hello.txt/fr
    editorCtrl.context = EditorService.initContext($stateParams.projectSlug,
      $stateParams.versionSlug, DocumentService.decodeDocId($stateParams.docId),
      LocaleService.DEFAULT_LOCALE, LocaleService.DEFAULT_LOCALE.localeId,
      'READ_WRITE');

    editorCtrl.toggleKeyboardShortcutsModal = function() {
      editorCtrl.showCheatsheet = !editorCtrl.showCheatsheet;
    };

    var SHOW_SUGGESTIONS = SettingsService.SETTING.SHOW_SUGGESTIONS;
    $scope.showSuggestions = SettingsService.subscribe(SHOW_SUGGESTIONS,
      function (show) {
        $scope.showSuggestions = show;
      });
    editorCtrl.toggleSuggestionPanel = function () {
      SettingsService.update(SHOW_SUGGESTIONS, !$scope.showSuggestions);
    };


    editorCtrl.versionPage = function() {
      return UrlService.PROJECT_PAGE(editorCtrl.context.projectSlug,
        editorCtrl.context.versionSlug);
    };

    editorCtrl.encodeDocId = function(docId) {
      return DocumentService.encodeDocId(docId);
    };

    ProjectService.getProjectInfo($stateParams.projectSlug).then(
      function(projectInfo) {
        editorCtrl.projectInfo = projectInfo;
      },
      function(error) {
        MessageHandler.displayError('Error getting project ' +
          'information:' + error);
      });

    LocaleService.getSupportedLocales(editorCtrl.context.projectSlug,
      editorCtrl.context.versionSlug).then(
      function(locales) {
        editorCtrl.locales = locales;
        if (!editorCtrl.locales || editorCtrl.locales.length <= 0) {
          //redirect if no supported locale in version
          MessageHandler.displayError('No supported locales in ' +
            editorCtrl.context.projectSlug + ' : ' +
            editorCtrl.context.versionSlug);
        } else {
          //if localeId is not defined in url, set to first from list
          var selectedLocaleId = $state.params.localeId;
          var context = editorCtrl.context;

          if (!selectedLocaleId) {
            context.localeId = editorCtrl.locales[0].localeId;
            transitionToEditorSelectedView();
          } else {
            context.localeId = selectedLocaleId;
            if (!LocaleService.containsLocale(editorCtrl.locales,
              selectedLocaleId)) {
              context.localeId = editorCtrl.locales[0].localeId;
            }
          }
        }
      }, function(error) {
        MessageHandler.displayError('Error getting locale list: ' + error);
      });

    DocumentService.findAll(editorCtrl.context.projectSlug,
      editorCtrl.context.versionSlug).then(
      function(documents) {
        editorCtrl.documents = documents;

        if (!editorCtrl.documents || editorCtrl.documents.length <= 0) {
          //redirect if no documents in version
          MessageHandler.displayError('No documents in ' +
            editorCtrl.context.projectSlug + ' : ' +
            editorCtrl.context.versionSlug);
        } else {
          //if docId is not defined in url, set to first from list
          var selectedDocId = $state.params.docId,
              context = editorCtrl.context;
          if (!selectedDocId) {
            context.docId = editorCtrl.documents[0].name;
            transitionToEditorSelectedView();
          } else {
            context.docId = DocumentService.decodeDocId(selectedDocId);
            if (!DocumentService.containsDoc(editorCtrl.documents,
              context.docId)) {
              context.docId = editorCtrl.documents[0].name;
            }
          }
        }
      }, function(error) {
        MessageHandler.displayError('Error getting document list: ' + error);
      });

    $rootScope.$on(EventService.EVENT.SELECT_TRANS_UNIT,
      function (event, data) {
        editorCtrl.unitSelected = data.id;
        editorCtrl.focused = data.focus;
      });

    $rootScope.$on(EventService.EVENT.CANCEL_EDIT,
      function () {
        editorCtrl.unitSelected = false;
        editorCtrl.focused = false;
      });

    $rootScope.$on(EventService.EVENT.REFRESH_STATISTIC,
      function (event, data) {

        loadStatistic(data.projectSlug, data.versionSlug, data.docId,
          data.localeId);

        editorCtrl.context.docId = data.docId;
        editorCtrl.context.localeId = data.localeId;
      });

    editorCtrl.pageNumber = function() {
      if(EditorService.maxPageIndex === 0) {
        return EditorService.currentPageIndex + 1;
      } else {
        return (EditorService.currentPageIndex + 1) + ' of ' +
          (EditorService.maxPageIndex + 1);
      }
    };

    editorCtrl.getLocaleName = function(localeId) {
      return LocaleService.getName(localeId);
    };

    editorCtrl.firstPage = function() {
      EventService.emitEvent(EventService.EVENT.GOTO_FIRST_PAGE);
    };

    editorCtrl.lastPage = function() {
      EventService.emitEvent(EventService.EVENT.GOTO_LAST_PAGE);
    };


    editorCtrl.nextPage = function() {
      EventService.emitEvent(EventService.EVENT.GOTO_NEXT_PAGE);
    };

    editorCtrl.previousPage = function() {
      EventService.emitEvent(EventService.EVENT.GOTO_PREV_PAGE);
    };

    editorCtrl.resetFilter = function() {
      resetFilter(true);
    };

    editorCtrl.updateFilter = function() {
      updateFilter(true);
    };

    function updateFilter(fireEvent) {
      if(isStatusSame(editorCtrl.filter.status)) {
        resetFilter(fireEvent);
      } else {
        editorCtrl.filter.status.all = false;
        if(fireEvent) {
          EventService.emitEvent(EventService.EVENT.FILTER_TRANS_UNIT,
            editorCtrl.filter);
        }
      }
    }

    function resetFilter(fireEvent) {
      editorCtrl.filter.status.all = true;
      editorCtrl.filter.status.approved = false;
      editorCtrl.filter.status.translated = false;
      editorCtrl.filter.status.needsWork = false;
      editorCtrl.filter.status.untranslated = false;

      if(fireEvent) {
        EventService.emitEvent(EventService.EVENT.FILTER_TRANS_UNIT,
          editorCtrl.filter);
      }
    }

    function isStatusSame(statuses) {
      return statuses.approved === statuses.translated &&
        statuses.translated === statuses.needsWork &&
        statuses.needsWork === statuses.untranslated;
    }

    function transitionToEditorSelectedView() {
      if (isDocumentAndLocaleSelected()) {
        $state.go('editor.selectedContext', {
          'docId': editorCtrl.context.docId,
          'localeId': editorCtrl.context.localeId
        });
      }
    }

    function isDocumentAndLocaleSelected() {
      return editorCtrl.context.docId && editorCtrl.context.localeId;
    }

    /**
     * Load document statistics (word and message)
     *
     * @param projectSlug
     * @param versionSlug
     * @param docId
     * @param localeId
     */
    function loadStatistic(projectSlug, versionSlug, docId, localeId) {
      DocumentService.getStatistics(projectSlug, versionSlug, docId, localeId)
        .then(function(statistics) {
            editorCtrl.wordStatistic = StatisticUtil
              .getWordStatistic(statistics);
            editorCtrl.messageStatistic = StatisticUtil
              .getMsgStatistic(statistics);
          },
          function(error) {
            MessageHandler.displayError('Error loading statistic: ' + error);
          });
    }

    this.settings = UserService.settings.editor;

    EditorShortcuts.enableEditorKeys();
  }
  EditorCtrl.$inject = ["$scope", "UserService", "DocumentService", "LocaleService", "ProjectService", "EditorService", "SettingsService", "StatisticUtil", "UrlService", "$stateParams", "$state", "MessageHandler", "$rootScope", "EventService", "EditorShortcuts", "_", "Mousetrap"];

  angular
    .module('app')
    .controller('EditorCtrl', EditorCtrl);
})();

(function() {
  'use strict';

  /**
   * EditorDetailsCtrl.js
   * @ngInject
   */
  function EditorDetailsCtrl() {
    var editorDetailsCtrl = this;

    return editorDetailsCtrl;
  }

  angular
    .module('app')
    .controller('EditorDetailsCtrl', EditorDetailsCtrl);
})();

(function () {
  'use strict';

  /**
   * EditorService.js
   * //TODO: parse editorContext in functions
   * @ngInject
   */
  function EditorService($rootScope, $resource, _, UrlService,
    EventService, PhraseService, PhraseUtil, DocumentService, MessageHandler,
    TransStatusService) {
    var editorService = this,
        queue = {};

    editorService.context = {};

    editorService.currentPageIndex = 0;
    editorService.maxPageIndex = 0;

    editorService.initContext =
      function (projectSlug, versionSlug, docId, srcLocale, localeId, mode) {
        editorService.context = {
          projectSlug: projectSlug,
          versionSlug: versionSlug,
          docId: docId,
          srcLocale: srcLocale,
          localeId: localeId,
          mode: mode // READ_WRITE, READ_ONLY, REVIEW
        };
        return editorService.context;
      };

    editorService.updateContext = function(projectSlug, versionSlug, docId,
                                           localeId) {
      if(editorService.context.projectSlug !== projectSlug) {
        editorService.context.projectSlug = projectSlug;
      }
      if(editorService.context.versionSlug !== versionSlug) {
        editorService.context.versionSlug = versionSlug;
      }
      if(editorService.context.docId !== docId) {
        editorService.context.docId = docId;
      }
      if(editorService.context.localeId !== localeId) {
        editorService.context.localeId = localeId;
      }
    };

    /**
     * EventService.EVENT.SAVE_TRANSLATION listener
     * Perform save translation with given status
     *
     * - queue save translation request (1 global queue, 1 for each TU)
     * - if queue contains request id, replace old request with new request
     */
    $rootScope.$on(EventService.EVENT.SAVE_TRANSLATION,
      function (event, data) {
        var phrase = data.phrase,
            status = data.status;
        if (!needToSavePhrase(phrase, status)) {
          // nothing has changed
          return;
        }

        //update pending queue if contains
        if (_.has(queue, phrase.id)) {
          var pendingRequest = queue[phrase.id];
          pendingRequest.phrase = phrase;
          pendingRequest.status = status;
        } else {
          status = resolveTranslationState(phrase, status);
          queue[phrase.id] = {
            'phrase': phrase,
            'status': status,
            'locale': data.locale,
            'docId': data.docId
          };
        }
        EventService.emitEvent(EventService.EVENT.SAVE_INITIATED, data);
        processSaveRequest(phrase.id);
      });

    function needToSavePhrase(phrase, status) {
      return PhraseUtil.hasTranslationChanged(phrase) ||
        phrase.status !== status;
    }

    // Process save translation request
    function processSaveRequest(id) {
      var context = _.cloneDeep(editorService.context);

      var request = queue[id];

      var Translation = $resource(UrlService.TRANSLATION_URL, {}, {
        update: {
          method: 'PUT',
          params: {
            localeId: request.locale
          }
        }
      });
      var data = {
        id: request.phrase.id,
        revision: request.phrase.revision || 0,
        content: request.phrase.newTranslations[0],
        contents: request.phrase.newTranslations,
        // Return status object to PascalCase Id for the server
        status: TransStatusService.getServerId(request.status.ID),
        plural: request.phrase.plural
      };

      Translation.update(data).$promise.then(
        function(response) {
          var oldStatus =  request.phrase.status.ID;

          PhraseService.onTransUnitUpdated(context, data.id, request.locale,
            response.revision, response.status, request.phrase);

          DocumentService.updateStatistic(context.projectSlug,
            context.versionSlug, request.docId, request.locale,
            oldStatus, TransStatusService.getId(response.status),
            request.phrase.wordCount);

          EventService.emitEvent(EventService.EVENT.SAVE_COMPLETED,
            request.phrase);
        },
        function(response) {
          MessageHandler.displayWarning('Update translation failed for ' +
            data.id + ' -' + response);
          PhraseService.onTransUnitUpdateFailed(data.id);
          EventService.emitEvent(EventService.EVENT.SAVE_COMPLETED,
            request.phrase);
        });
      delete queue[id];
    }

    function resolveTranslationState(phrase, requestStatus) {
      if (_.isEmpty(_.compact(phrase.newTranslations))) {
        return TransStatusService.getStatusInfo('UNTRANSLATED');
      }
      return requestStatus;
    }

    return editorService;
  }
  EditorService.$inject = ["$rootScope", "$resource", "_", "UrlService", "EventService", "PhraseService", "PhraseUtil", "DocumentService", "MessageHandler", "TransStatusService"];

  angular
    .module('app')
    .factory('EditorService', EditorService);

})();


(function () {
  'use strict';

  /**
   * @name EditorShortcuts
   * @description service for editor keyboard shortcuts
   * @ngInject
   */
  function EditorShortcuts(EventService, $stateParams, _, hotkeys, PhraseUtil,
                           TransStatusService, Mousetrap, str, $window) {
    var editorShortcuts = this,
      inSaveAsMode = false;

    // this will be set by TransUnitService
    // on EVENT.SELECT_TRANS_UNIT and unset on EVENT.CANCEL_EDIT
    editorShortcuts.selectedTUCtrl = null;

    function copySourceCallback(event) {
      if (editorShortcuts.selectedTUCtrl) {
        event.preventDefault();
        EventService.emitEvent(EventService.EVENT.COPY_FROM_SOURCE,
          {'phrase': editorShortcuts.selectedTUCtrl.getPhrase()});
      }
    }

    function gotoNextRowCallback(event) {
      if (editorShortcuts.selectedTUCtrl) {
        event.preventDefault();
        event.stopPropagation();
        EventService.emitEvent(EventService.EVENT.GOTO_NEXT_ROW,
          currentContext());
      }
    }

    function gotoPreviousRowCallback(event) {
      if (editorShortcuts.selectedTUCtrl) {
        event.preventDefault();
        event.stopPropagation();
        EventService.emitEvent(EventService.EVENT.GOTO_PREVIOUS_ROW,
          currentContext());
      }
    }

    function cancelEditCallback(event) {
      event.preventDefault();
      event.stopPropagation();
      if (inSaveAsMode) {
        editorShortcuts.cancelSaveAsModeIfOn();
        if (editorShortcuts.selectedTUCtrl) {
          editorShortcuts.selectedTUCtrl.focusTranslation();
        }
      } else if (editorShortcuts.selectedTUCtrl) {
        var phrase = editorShortcuts.selectedTUCtrl.getPhrase();
        if (PhraseUtil.hasTranslationChanged(phrase)) {
          // if it has changed translation, undo edit
          EventService.emitEvent(EventService.EVENT.UNDO_EDIT,
            phrase);
        } else {
          // otherwise cancel edit
          EventService.emitEvent(EventService.EVENT.CANCEL_EDIT,
            phrase);
        }
      }
    }

    function saveAsCurrentButtonOptionCallback(event) {
      if (editorShortcuts.selectedTUCtrl) {
        event.preventDefault();
        var phrase = editorShortcuts.selectedTUCtrl.getPhrase();
        EventService.emitEvent(EventService.EVENT.SAVE_TRANSLATION,
          {
            'phrase': phrase,
            'status': PhraseUtil.getSaveButtonStatus(phrase),
            'locale': $stateParams.localeId,
            'docId': $stateParams.docId
          });
      }
    }

    /**
     * This is to mimic sequence shortcut.
     * e.g. press ctlr-shift-s then press 'n' to save as
     * 'needs work'.
     */
    function saveAsModeCallback(event) {
      event.preventDefault();
      editorShortcuts.cancelSaveAsModeIfOn();
      var phrase = editorShortcuts.selectedTUCtrl.getPhrase();
      if (phrase) {
        EventService.emitEvent(EventService.EVENT.TOGGLE_SAVE_OPTIONS,
          {
            'id': phrase.id,
            'open': true
          });

        addSaveAsModeExtensionKey(phrase, 'n', 'needsWork');
        addSaveAsModeExtensionKey(phrase, 't', 'translated');
        addSaveAsModeExtensionKey(phrase, 'a', 'approved');
      }
    }

    /**
     * Generate a callback that will copy one of the suggestions to the editor.
     *
     * @param {number} oneBasedIndex the 1-based index of the suggestion that
     *                               this callback will copy
     * @return {function} callback that will copy the nth suggestion.
     */
    function copySuggestionCallback(oneBasedIndex) {
      return (function (event) {
        event.preventDefault();
        EventService.emitEvent(EventService.EVENT.COPY_FROM_SUGGESTION_N,
          oneBasedIndex-1);
      });
    }

    /**
     * mod will be replaced by ctrl if on windows/linux or cmd if on mac.
     * By default it listens on keydown event.
     */
    editorShortcuts.SHORTCUTS = {
      COPY_SOURCE: new ShortcutInfo(
        'alt+c', copySourceCallback, 'Copy source as translation', 'alt+g'),

      COPY_SUGGESTION_1: new ShortcutInfo(
        'mod+alt+1', copySuggestionCallback(1),
        'Copy first suggestion as translation'),

      COPY_SUGGESTION_2: new ShortcutInfo(
        'mod+alt+2', copySuggestionCallback(2),
        'Copy second suggestion as translation'),

      COPY_SUGGESTION_3: new ShortcutInfo(
        'mod+alt+3', copySuggestionCallback(3),
        'Copy third suggestion as translation'),

      COPY_SUGGESTION_4: new ShortcutInfo(
        'mod+alt+4', copySuggestionCallback(4),
        'Copy fourth suggestion as translation'),

      CANCEL_EDIT: new ShortcutInfo('esc', cancelEditCallback, 'Cancel edit'),

      SAVE_AS_CURRENT_BUTTON_OPTION: new ShortcutInfo(
        'mod+s', saveAsCurrentButtonOptionCallback, 'Save'),

      SAVE_AS_MODE: new ShortcutInfo(
        'mod+shift+s', saveAsModeCallback, 'Save as…'),

      // this is just so we can show it in cheatsheet.
      // see app/editor/EditorCtrl.shortcuts
      SAVE_AS_NEEDSWORK: {
        keyCombos: [{combo: 'mod+shift+s n', description: 'Save as needs work'}]
      },

      SAVE_AS_TRANSLATED: {
        keyCombos: [{combo: 'mod+shift+s t', description: 'Save as translated'}]
      },

      SAVE_AS_APPROVED: {
        keyCombos: [{combo: 'mod+shift+s a', description: 'Save as approved'}]
      },

      GOTO_NEXT_ROW_FAST: new ShortcutInfo(
        'mod+enter', gotoNextRowCallback,
        'Save (if changed) and go to next string',
        ['alt+k', 'alt+down']),

      GOTO_PREVIOUS_ROW: new ShortcutInfo(
        'mod+shift+enter', gotoPreviousRowCallback,
        'Save (if changed) and go to previous string',
        ['alt+j', 'alt+up'])
        /*
         Disable for now until status navigation implementation
         GOTO_NEXT_UNTRANSLATED: new ShortcutInfo(
        'tab+u', gotoToNextUntranslatedCallback)
        */
    };

    /*
     Disable for now until status navigation implementation

     function gotoToNextUntranslatedCallback(event) {
     event.preventDefault();
     event.stopPropagation();
     if (editorShortcuts.selectedTUCtrl) {
     EventService.emitEvent(EventService.EVENT.GOTO_NEXT_UNTRANSLATED,
     currentContext());
     }
     // the shortcut is a tab + u combination
     // we don't want other tab event to trigger
     tabCombinationPressed = true;
     }
     */

    /**
     *
     * @param {string} defaultKey default key combo for a shortcut
     * @param {function} callback callback to execute
     * @param {string} [description]
     *  optional. If not empty will apply to default key (shows in cheatsheet)
     * @param {(string|string[])} [otherKeys]
     *  optional other keys that will do the same (won't show in cheatsheet)
     * @param {string} [action] optional event to listen to. e.g. 'keyup'
     * @returns {EditorShortcuts.ShortcutInfo}
     * @constructor
     */
    function ShortcutInfo(defaultKey, callback, description, otherKeys, action)
    {
      this.defaultKey = defaultKey;
      this.keyCombos = [
        singleKeyConfig(defaultKey, description, action, callback)
      ];
      if (otherKeys) {
        this.otherKeys = otherKeys instanceof Array ? otherKeys : [otherKeys];
        this.keyCombos.push(
          singleKeyConfig(this.otherKeys, '', action, callback));
      }
      return this;
    }

    function singleKeyConfig(combo, description, action, callback) {
      var keyConfig = {
        allowIn: ['TEXTAREA'],
        callback: callback
      };
      keyConfig.combo = combo;
      if (description) {
        keyConfig.description = description;
      }
      if (action) {
        keyConfig.action = action;
      }
      return keyConfig;
    }

    editorShortcuts.enableEditorKeys = function () {
      // here we only check copy source shortcut since we always enable keys in
      // bundle.
      if (!hotkeys.get(editorShortcuts.SHORTCUTS.COPY_SOURCE.defaultKey)) {
        _.forOwn(editorShortcuts.SHORTCUTS, function(value) {
          if (value instanceof ShortcutInfo) { // a hack to handle sequence keys
            enableShortcut(value);
          }
        });
      }
    };

    editorShortcuts.disableEditorKeys = function () {
      _.forOwn(editorShortcuts.SHORTCUTS, function(value) {
        _.forEach(value.keyCombos, function(hotkey) {
          editorShortcuts.deleteKeys(hotkey.combo, hotkey.action);
        });
      });
    };

    function enableShortcut(shortcutInfo) {
      if (!hotkeys.get(shortcutInfo.defaultKey)) {
        _.forEach(shortcutInfo.keyCombos,
          function(combo) {
            hotkeys.add(combo);
          });
      }
    }

    function currentContext() {
      return {
        'currentId': editorShortcuts.selectedTUCtrl.getPhrase().id
      };
    }

    function addSaveAsModeExtensionKey(phrase, combo, status) {
      var statusInfo = TransStatusService.getStatusInfo(status);
      return hotkeys.add({
        combo: combo,
        description: str.sprintf('Save as %s', status),
        allowIn: ['INPUT', 'TEXTAREA'],
        action: 'keydown',
        callback: function (event) {
          editorShortcuts.saveTranslationCallBack(event, phrase, statusInfo);
        }
      });
    }

    editorShortcuts.saveTranslationCallBack = function(event, phrase,
                                                       statusInfo) {
      inSaveAsMode = true;

      event.preventDefault();
      event.stopPropagation();

      EventService.emitEvent(EventService.EVENT.SAVE_TRANSLATION,
        {
          'phrase': phrase,
          'status': statusInfo,
          'locale': $stateParams.localeId,
          'docId': $stateParams.docId
        });
      editorShortcuts.cancelSaveAsModeIfOn();
    };

    editorShortcuts.cancelSaveAsModeIfOn = function() {
      if (inSaveAsMode && editorShortcuts.selectedTUCtrl) {
        inSaveAsMode = false;
        editorShortcuts.deleteKeys(['n', 't', 'a']);
        EventService.emitEvent(EventService.EVENT.TOGGLE_SAVE_OPTIONS,
          {
            'id': editorShortcuts.selectedTUCtrl.getPhrase().id,
            'open': false
          });
      }
    };

    /**
     * This is a workaround for augular-hotkeys not being able to delete hotkey.
     * @see https://github.com/chieffancypants/angular-hotkeys/issues/100
     *
     * @param {(string|string[])} keys single key or array of keys to be deleted
     * @param {string} [action='keydown'] 'keyup' or 'keydown' etc.
     */
    editorShortcuts.deleteKeys = function(keys, action) {
      var keysToDelete = keys instanceof Array ? keys : [keys];
      action = action || 'keydown';
      _.forEach(keysToDelete, function(key) {
        hotkeys.del(key);
        Mousetrap.unbind(key, action);
      });
    };

    /**
     * Copied from angular-hotkeys.
     * Convert strings like cmd into symbols like ⌘
     * @param  {String} combo Key combination, e.g. 'mod+f'
     * @return {String} The key combination with symbols
     */
    editorShortcuts.symbolizeKey = function (combo) {
      var map = {
        command: '⌘',
        shift: '⇧',
        left: '←',
        right: '→',
        up: '↑',
        down: '↓',
        'return': '↩',
        backspace: '⌫'
      };
      combo = combo.split('+');

      for (var i = 0; i < combo.length; i++) {
        // try to resolve command / ctrl based on OS:
        if (combo[i] === 'mod') {
          if ($window.navigator &&
            $window.navigator.platform.indexOf('Mac') >= 0) {
            combo[i] = 'command';
          } else {
            combo[i] = 'ctrl';
          }
        }

        combo[i] = map[combo[i]] || combo[i];
      }

      return combo.join(' + ');
    };

    return editorShortcuts;
  }
  EditorShortcuts.$inject = ["EventService", "$stateParams", "_", "hotkeys", "PhraseUtil", "TransStatusService", "Mousetrap", "str", "$window"];

  angular
    .module('app')
    .factory('EditorShortcuts', EditorShortcuts);
})();


(function() {
  'use strict';

  /**
   * EditorSuggestionsCtrl.js
   * @ngInject
   */
  function EditorSuggestionsCtrl($scope, _, SettingsService,
      PhraseSuggestionsService, TextSuggestionsService, EventService,
      $rootScope, $timeout, focus) {
    var SHOW_SUGGESTIONS_SETTING = SettingsService.SETTING.SHOW_SUGGESTIONS;
    var SUGGESTIONS_SHOW_DIFFERENCE_SETTING =
      SettingsService.SETTING.SUGGESTIONS_SHOW_DIFFERENCE;

    var editorSuggestionsCtrl = this;

    $scope.suggestions = [];
    $scope.hasSuggestions = false;
    $scope.$watch('suggestions.length', function (length) {
      $scope.hasSuggestions = length !== 0;
    });

    /* @type {string[]} */
    $scope.searchStrings = [];
    $scope.hasSearch = false;
    $scope.$watch('searchStrings.length', function (length) {
      $scope.hasSearch = length !== 0;
    });

    // TODO initialize with current trans unit selection state.
    $scope.isTransUnitSelected = false;

    // These must always be opposites. Probably change to an enum.
    $scope.isTextSearch = false;
    $scope.isPhraseSearch = true;

    function setTextSearch(active) {
      $scope.isTextSearch = active;
      $scope.isPhraseSearch = !active;
    }

    $scope.search = {
      isVisible: false,
      isLoading: false,
      input: {
        text: '',
        focused: false
      }
    };

    $scope.$watch('search.input.text', function () {
      editorSuggestionsCtrl.searchForText();
    });

    $scope.show = SettingsService.subscribe(SHOW_SUGGESTIONS_SETTING,
      function (show) {
        $scope.show = show;

        if (show) {
          if ($scope.isTransUnitSelected) {
            updatePhraseDisplay();
          } else {
            if (!$scope.search.isVisible) {
              showSearch(null, true);
            }
          }
        }

      });

    $scope.diff = SettingsService.subscribe(SUGGESTIONS_SHOW_DIFFERENCE_SETTING,
      function (diff) {
        $scope.diff = diff;
      });

    $scope.focusSearch = function($event) {
      if ($event) {
        $event.preventDefault();
      }
      focus('searchSugInput');
    };

    editorSuggestionsCtrl.closeSuggestions = function () {
      SettingsService.update(SHOW_SUGGESTIONS_SETTING, false);
      EventService.emitEvent(EventService.EVENT.SUGGESTIONS_SEARCH_TOGGLE,
        false);
    };

    editorSuggestionsCtrl.clearSearchResults =
      function($event, dontFocusInput) {
        // just remove the text, service will handle updating to empty results.
        $scope.search.input.text = '';

        if (!dontFocusInput && $event) {
          $scope.focusSearch($event);
        }
      };

    editorSuggestionsCtrl.searchForText = function () {
      var newText = $scope.search.input.text;
      if (newText.length > 0) {
        $scope.search.isLoading = true;
      }
      setTextSearch(true);
      EventService.emitEvent(EventService.EVENT.REQUEST_TEXT_SUGGESTIONS,
        newText);
    };

    editorSuggestionsCtrl.toggleSearch = function() {
      if ($scope.search.isVisible) {
        EventService.emitEvent(EventService.EVENT.SUGGESTIONS_SEARCH_TOGGLE,
          false);
      }
      else {
        EventService.emitEvent(EventService.EVENT.SUGGESTIONS_SEARCH_TOGGLE,
          true);
      }
    };

    // Init
    if ($scope.show && !$scope.isTransUnitSelected) {
      showSearch();
    }

    // TODO move sorting/filtering to suggestion service
    function displaySuggestions(suggestions) {
      var filteredSuggestions = _.chain(suggestions)
        .sortBy(['similarityPercent', 'relevanceScore'])
        .reverse()
        .value();

      $scope.suggestions = filteredSuggestions;
    }

    function hideSearch() {
      $scope.search.isVisible = false;
      setTextSearch(false);
      updatePhraseDisplay();
    }

    function showSearch($event, dontFocusInput) {
      $scope.search.input.text = '';
      $scope.search.isVisible = true;
      if (!dontFocusInput && $event) {
        $scope.focusSearch($event);
      }
      editorSuggestionsCtrl.searchForText();
      updateTextDisplay();
    }

    $rootScope.$on(EventService.EVENT.SELECT_TRANS_UNIT,
      function () {
        // Automatically switch back to phrase search when no search is entered
        if ($scope.search.input.text === '' && $scope.search.isVisible) {
          EventService.emitEvent(EventService.EVENT.SUGGESTIONS_SEARCH_TOGGLE,
           false);
        }
        $scope.isTransUnitSelected = true;
      });

    $rootScope.$on(EventService.EVENT.CANCEL_EDIT,
      function () {
        $scope.isTransUnitSelected = false;
        if ($scope.show && !$scope.search.isVisible) {
          showSearch(null, true);
        }
      });

    $rootScope.$on(EventService.EVENT.SUGGESTIONS_SEARCH_TOGGLE,
    function(event, activate) {
      if (activate) {
        showSearch(event);
      }
      else {
        hideSearch(event);
      }
    });

    // Automatic suggestions search on row select
    $rootScope.$on('PhraseSuggestionsService:updated', function () {
      if ($scope.isPhraseSearch) {
        updatePhraseDisplay();
      }
    });

    /**
     * Update all the state to match the latest from the phrase search.
     */
    function updatePhraseDisplay() {
      $scope.searchStrings = PhraseSuggestionsService.getSearchStrings();
      $scope.search.isLoading = PhraseSuggestionsService.isLoading();
      displaySuggestions(PhraseSuggestionsService.getResults());
    }


    // Manual suggestions search
    $rootScope.$on('TextSuggestionsService:updated', function () {
      if ($scope.isTextSearch) {
        updateTextDisplay();
      }
    });

    /**
     * Update all the state to match the latest from the text search service.
     */
    function updateTextDisplay() {
      $scope.searchStrings = TextSuggestionsService.getSearchStrings();
      $scope.search.isLoading = TextSuggestionsService.isLoading();
      displaySuggestions(TextSuggestionsService.getResults());
    }

    $rootScope.$on(EventService.EVENT.COPY_FROM_SUGGESTION_N,
      function (event, matchIndex) {

        if ($scope.show) {
          // copy visible suggestion with that index
          copySuggestion($scope.suggestions[matchIndex]);

          // event for copy button on suggestion to display 'copied'
          $scope.$broadcast('EditorSuggestionsCtrl:nth-suggestion-copied',
                            matchIndex);

        } else {
          // copy suggestion from background phrase search
          copySuggestion(PhraseSuggestionsService.getResults()[matchIndex]);
        }

      });


    function copySuggestion(suggestion) {
      if (suggestion) {
        EventService.emitEvent(EventService.EVENT.COPY_FROM_SUGGESTION,
          { suggestion: suggestion });
      }
    }

    return editorSuggestionsCtrl;
  }
  EditorSuggestionsCtrl.$inject = ["$scope", "_", "SettingsService", "PhraseSuggestionsService", "TextSuggestionsService", "EventService", "$rootScope", "$timeout", "focus"];

  angular
    .module('app')
    .controller('EditorSuggestionsCtrl', EditorSuggestionsCtrl);
})();

(function() {
  'use strict';

  /**
   * @name blur-on
   * @description When you put attribute 'blur-on="something"',
   * you can then blur this element. It works the same way as focus-on library.
   */
  function blurOn() {
    return {
      restrict: 'A',
      link: function(scope, elem, attr) {
        return scope.$on('blurOn', function (e, name) {
          if (name === attr.blurOn) {
              return elem[0].blur();
            }
          });
        }
    };
  }

  angular
    .module('app')
    .directive('blurOn', blurOn);

})();

(function() {
  'use strict';

  /**
   * @name clickElsewhere
   * @description Initiate expression when clicking somewhere else
   * @ngInject
   */
  function clickElsewhere($document) {
    return {
      restrict: 'A',
      scope: {
        callback: '&clickElsewhere'
      },
      link: function(scope, element) {
        var handler = function(e) {
          if (!element[0].contains(e.target)) {
            scope.$apply(scope.callback(e));
          }
        };

        $document.on('click', handler);

        scope.$on('$destroy', function() {
          $document.off('click', handler);
        });
      }
    };
  }
  clickElsewhere.$inject = ["$document"];

  angular
    .module('app')
    .directive('clickElsewhere', clickElsewhere);

})();

(function() {
  'use strict';

  /**
   * Handle server communication on document related
   * information in project-version.
   *
   * DocumentService.js
   * @ngInject
   */
  function DocumentService($q, $resource, UrlService, StringUtil,
                           StatisticUtil, EventService, _, TransStatusService) {
    var documentService = this,
        statisticMap = {};

    /**
     * Finds all documents in given project version
     *
     * @param _projectSlug
     * @param _versionSlug
     * @returns {$promise|*|N.$promise}
     */
    documentService.findAll = function findAll(_projectSlug, _versionSlug) {
      var Documents = $resource(UrlService.DOCUMENT_LIST_URL, {}, {
        query: {
          method: 'GET',
          params: {
            projectSlug: _projectSlug,
            versionSlug: _versionSlug
          },
          isArray: true
        }
      });
      return Documents.query().$promise;
    };

    /**
     * Get statistic of document in locale (word and message)
     *
     * @param _projectSlug
     * @param _versionSlug
     * @param _docId
     * @param _localeId
     * @returns {*}
     */
    documentService.getStatistics = function (_projectSlug, _versionSlug,
      _docId, _localeId) {
      if (_docId && _localeId) {
        var key = generateStatisticKey(_docId,  _localeId);
        if (_.has(statisticMap, key)) {
          return $q.when(statisticMap[key]);
        } else {
          var encodedDocId = documentService.encodeDocId(_docId);
          var Statistics = $resource(UrlService.DOC_STATISTIC_URL, {}, {
            query: {
              method: 'GET',
              params: {
                projectSlug: _projectSlug,
                versionSlug: _versionSlug,
                docId: encodedDocId,
                localeId: _localeId
              },
              isArray: true
            }
          });
          return Statistics.query().$promise.then(function(statistics) {

            // Make needReview(server) available to needswork
            _.forEach(statistics, function(statistic) {
              statistic[TransStatusService.getId('needswork')] =
                statistic.needReview || 0;
            });

            statisticMap[key] = statistics;
            return statisticMap[key];
          });
        }
      }
    };

    /**
     * Encode docId, replace '/' with ',' when REST call
     * @param docId
     * @returns {*}
     */
    documentService.encodeDocId = function(docId) {
      return docId ? docId.replace(/\//g, ',') : docId;
    };

    /**
     * Encode docId, replace ',' with '/' when REST call
     * @param docId
     * @returns {*}
     */
    documentService.decodeDocId = function(docId) {
      return docId ? docId.replace(/\,/g, '/') : docId;
    };

    documentService.containsDoc = function (documents, docId) {
      return _.any(documents, function(document) {
         return StringUtil.equals(document.name, docId, true);
      });
    };

    documentService.updateStatistic = function(projectSlug, versionSlug, docId,
                                               localeId, oldState,
                                               newState, wordCount) {
      var key = generateStatisticKey(docId, localeId);
      if(_.has(statisticMap, key)) {
        adjustStatistic(statisticMap[key], oldState, newState,
          wordCount);

        EventService.emitEvent(EventService.EVENT.REFRESH_STATISTIC,
          {
            projectSlug: projectSlug,
            versionSlug: versionSlug,
            docId: docId,
            localeId: localeId
          }
        );
      }
    };

    //Generate unique key from docId and localeId for statistic cache
    function generateStatisticKey(docId, localeId) {
      return docId + '-' + localeId;
    }

    /**
     * Adjust statistic based on translation change of state
     * word - -wordCount of oldState, +wordCount of newState
     * msg - -1 of oldState, +1 of newState
     */
    function adjustStatistic(statistics, oldState, newState, wordCount) {

      var wordStatistic = StatisticUtil.getWordStatistic(statistics),
        msgStatistic = StatisticUtil.getMsgStatistic(statistics);

      if(wordStatistic) {
        wordCount = parseInt(wordCount);
        var wordOldState = parseInt(wordStatistic[oldState]) - wordCount;
        wordStatistic[oldState] = wordOldState < 0 ? 0 : wordOldState;
        wordStatistic[newState] = parseInt(wordStatistic[newState]) + wordCount;
      }

      if(msgStatistic) {
        var msgOldState = parseInt(msgStatistic[oldState]) - 1;
        msgStatistic[oldState] = msgOldState < 0 ? 0 : msgOldState;
        msgStatistic[newState] = parseInt(msgStatistic[newState]) + 1;
      }
    }

    return documentService;
  }
  DocumentService.$inject = ["$q", "$resource", "UrlService", "StringUtil", "StatisticUtil", "EventService", "_", "TransStatusService"];

  angular
    .module('app')
    .factory('DocumentService', DocumentService);
})();

(function() {
  'use strict';

  /**
   * @name DropdownCtrl
   *
   * @description
   * Handle dropdown events between directives
   *
   * @ngInject
   */
  function DropdownCtrl($scope, $attrs, $parse, dropdownConfig,
    DropdownService, $animate, $timeout) {
    var dropdownCtrl = this,
        // create a child scope so we are not polluting original one
        scope = $scope.$new(),
        openClass = dropdownConfig.openClass,
        getIsOpen,
        setIsOpen = angular.noop,
        toggleInvoker = $attrs.onToggle ?
          $parse($attrs.onToggle) : angular.noop;

    this.init = function(element) {
      dropdownCtrl.$element = element;

      if ($attrs.isOpen) {
        getIsOpen = $parse($attrs.isOpen);
        setIsOpen = getIsOpen.assign;

        $scope.$watch(getIsOpen, function(value) {
          scope.isOpen = !!value;
        });
      }
    };

    this.toggle = function(open) {
      scope.isOpen = arguments.length ? !!open : !scope.isOpen;
      return scope.isOpen;
    };

    // Allow other directives to watch status
    this.isOpen = function() {
      return scope.isOpen;
    };

    scope.getToggleElement = function() {
      return dropdownCtrl.toggleElement;
    };

    scope.focusToggleElement = function() {
      if (dropdownCtrl.toggleElement) {
        dropdownCtrl.toggleElement[0].focus();
      }
    };

    scope.$watch('isOpen', function(isOpen, wasOpen) {
      $animate[isOpen ? 'addClass' : 'removeClass']
        (dropdownCtrl.$element, openClass);

      if (isOpen) {
        // need to wrap it in a timeout
        // see http://stackoverflow.com/questions/12729122/
        // prevent-error-digest-already-in-progress-when-calling-scope-apply
        $timeout(function() {
          scope.focusToggleElement();
        });
        DropdownService.open(scope);
      } else {
        DropdownService.close(scope);
      }

      setIsOpen($scope, isOpen);
      if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
        toggleInvoker($scope, {
          open: !!isOpen
        });
      }
    });

    $scope.$on('$locationChangeSuccess', function() {
      scope.isOpen = false;
    });

    $scope.$on('$destroy', function() {
      scope.$destroy();
    });

    $scope.$on('openDropdown', function() {
      scope.isOpen = true;
    });

    $scope.$on('closeDropdown', function() {
      scope.isOpen = false;
    });
  }
  DropdownCtrl.$inject = ["$scope", "$attrs", "$parse", "dropdownConfig", "DropdownService", "$animate", "$timeout"];

  angular
    .module('app')
    .controller('DropdownCtrl', DropdownCtrl);

})();

(function() {
  'use strict';

  /**
   * @name dropdownService
   *
   * @description
   * Handle dropdown events between directives
   *
   * @ngInject
   */

  function DropdownService($document) {
    var openScope = null,
        dropdownService = this;

    dropdownService.open = function(dropdownScope) {
      if (!openScope) {
        $document.bind('click', closeDropdown);
        $document.bind('keydown', escapeKeyBind);
      }

      if (openScope && openScope !== dropdownScope) {
        openScope.isOpen = false;
      }

      openScope = dropdownScope;
    };

    dropdownService.close = function(dropdownScope) {
      if (openScope === dropdownScope) {
        openScope = null;
        $document.unbind('click', closeDropdown);
        $document.unbind('keydown', escapeKeyBind);
      }
    };

    var closeDropdown = function(evt) {
      if (!openScope) {
        return;
      }
      var toggleElement = openScope.getToggleElement();
      if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
        return;
      }

      openScope.$apply(function() {
        openScope.isOpen = false;
      });
    };

    var escapeKeyBind = function(evt) {
      if (evt.which === 27) {
        openScope.focusToggleElement();
        closeDropdown();
      }
    };
  }
  DropdownService.$inject = ["$document"];

  angular
    .module('app')
    .service('DropdownService', DropdownService);

})();


(function() {
  'use strict';

  /**
   * @name Dropdown
   *
   * @description
   * Custom module for dropdowns
   *
   */
  var dropdownConfig = {
    openClass: 'is-active'
  };

  angular
    .module('app')
    .constant('dropdownConfig', dropdownConfig);

})();

(function() {
  'use strict';

  /**
   * @name dropdown
   *
   * @description
   * Main dropdown container
   *
   */

  function dropdown() {
    return {
      restrict: 'EA',
      controller: 'DropdownCtrl',
      link: function(scope, element, attrs, dropdownCtrl) {
        dropdownCtrl.init(element);
      }
    };
  }

  function onCloseDropdown() {
    return {
      restrict: 'A',
      require: '?^dropdown',
      scope: {
        callback: '&onCloseDropdown'
      },
      link: function(scope, elem, attrs, dropdownCtrl) {
        dropdownCtrl.onCloseDropdown = scope.callback;
      }
    };
  }

  /**
   * @name dropdown-toggle
   *
   * @description
   * Main dropdown toggle
   *
   */

  function dropdownToggle() {
    return {
      restrict: 'EA',
      require: '?^dropdown',
      link: function(scope, element, attrs, dropdownCtrl) {
        if (!dropdownCtrl) {
          return;
        }

        dropdownCtrl.toggleElement = element;

        var toggleDropdown = function(event) {
          event.preventDefault();
          event.stopPropagation();

          if (!element.hasClass('disabled') && !attrs.disabled) {
            scope.$apply(function() {
              dropdownCtrl.toggle();
            });
          }
        };

        element.bind('click', toggleDropdown);

        // WAI-ARIA
        element.attr({
          'aria-haspopup': true,
          'aria-expanded': false
        });
        scope.$watch(dropdownCtrl.isOpen, function(isOpen) {
          element.attr('aria-expanded', !!isOpen);
          if (dropdownCtrl.onCloseDropdown && !isOpen) {
            scope.$applyAsync(dropdownCtrl.onCloseDropdown);
          }
        });

        scope.$on('$destroy', function() {
          element.unbind('click', toggleDropdown);
        });
      }
    };
  }

  angular
    .module('app')
    .directive('dropdown', dropdown)
    .directive('onCloseDropdown', onCloseDropdown)
    .directive('dropdownToggle', dropdownToggle);

})();


(function () {
  'use strict';

  /**
   * EventService.js
   * Broadcast events service in app.
   * Usage: EventService.emitEvent(<String> event, <Map> data, scope)
   * See EventService.emitEvent
   *
   * @ngInject
   */
  function EventService($rootScope) {
    var eventService = this;

    /**
     * @enum {string}
     */
    eventService.EVENT = {
      /**
       * Loading Events
       *
       * Broadcast from AppConfig
       */
      LOADING_START: 'loadingStart',
      LOADING_STOP: 'loadingStop',

      /**
       * scroll to trans unit
       * data: {id: number, updateURL: boolean, focus: boolean}
       * id: (transunit id),
       * updateURL: (flag on whether to update url with trans unit id)
       * focus: flag on whether to have row in view and focused
       */
      SELECT_TRANS_UNIT: 'selectTransUnit',

      //data: {phrase: Phrase, sourceIndex:sourceIndex}
      COPY_FROM_SOURCE: 'copyFromSource',

      // data: { suggestion: Suggestion }
      COPY_FROM_SUGGESTION: 'copyFromSuggestion',

      /**
       * Emit this to trigger copying of the nth suggestion to the selected row.
       *
       * data: number (zero-based index of suggestion to copy)
       */
      COPY_FROM_SUGGESTION_N: 'copyFromSuggestionN',

      //data: {phrase: Phrase}
      UNDO_EDIT: 'undoEdit',

      //data: {phrase: Phrase}
      CANCEL_EDIT: 'cancelEdit',

      //data:phrase
      FOCUS_TRANSLATION: 'focusTranslation',

      /**
       * data: {
       *  phrase: Phrase, status: StatusInfo, locale: string, docId: string
       * }
       * phrase:
       * status: Object. Request save state
       * locale: target locale
       * docId: docId
       */
      SAVE_TRANSLATION: 'saveTranslation',

      /**
       * Translation save in this editor is being sent to the server and
       * is waiting on a response.
       */
      SAVE_INITIATED: 'saveInitiated',

      /**
       * Translation save in this editor has been completed
       * (Server has responded with a success or error).
       */
      SAVE_COMPLETED: 'saveCompleted',

      /**
       * The text in the translation editor textbox has been edited and
       * not yet saved.
       */
      TRANSLATION_TEXT_MODIFIED: 'translationTextModified',

      /**
       * refresh ui statistic - changes in doc or locale
       *
       * data: {projectSlug: string, versionSlug: string,
       *  docId: string, localeId: string}
       */
      REFRESH_STATISTIC: 'refreshStatistic',

      GOTO_PREV_PAGE: 'gotoPreviousPage',

      GOTO_NEXT_PAGE: 'gotoNextPage',

      GOTO_FIRST_PAGE: 'gotoFirstPage',

      GOTO_LAST_PAGE: 'gotoLastPage',

      /**
       * data: { currentId: number }
       */
      GOTO_NEXT_ROW: 'gotoNextRow',
      GOTO_PREVIOUS_ROW: 'gotoPreviousRow',
      GOTO_NEXT_UNTRANSLATED: 'gotoNextUntranslated',

      /**
       * Toggle save as options dropdown.
       * data: {id: number, open: boolean}
       */
      TOGGLE_SAVE_OPTIONS: 'openSaveOptions',


      /**
       * data: {filter: refer to editorCtrl.filter}
       */
      FILTER_TRANS_UNIT: 'filterTransUnit',

      /**
       * Reports the number of suggestions that are available for a phrase.
       *
       * data: { id: number, count: number }
       */
      PHRASE_SUGGESTION_COUNT: 'phraseSuggestionCount',

      /**
       * Fire to request suggestions from translation memory, etc.
       *
       * data: { phrase: Phrase }
       */
      REQUEST_PHRASE_SUGGESTIONS: 'requestPhraseSuggestions',

      /**
       * Fire for manual suggestions search using a single string.
       *
       * data: string
       */
      REQUEST_TEXT_SUGGESTIONS: 'requestTextSuggestions',

      /**
       * Fired every time search is toggled
       *
       * @type {Boolean}
       */
      SUGGESTIONS_SEARCH_TOGGLE: 'suggestionsSearchToggle',

      /**
       * Indicates a single user setting has changed.
       *
       * Event handlers should switch on the setting name to determine whether
       * it is a setting they are interested in.
       *
       * data: { setting: string, value: boolean|number|string }
       */
      USER_SETTING_CHANGED: 'userSettingChanged'
    };

    /**
     * Firing an event downwards of scope
     *
     * @param event - eventService.EVENT type
     * @param data - data for the event
     * @param scope - scope of event to to fire, $rootScope if empty
     */
    eventService.broadcastEvent = function(event, data, scope) {
      scope = scope || $rootScope;
      scope.$broadcast(event, data);
    };

    /**
     * Firing an event upwards of scope
     *
     * @param event - eventService.EVENT types
     * @param data - data for the event
     * @param scope - scope of event to to fire, $rootScope if empty
     */
    eventService.emitEvent = function(event, data, scope) {
      scope = scope || $rootScope;
      scope.$emit(event, data);
    };

    return eventService;
  }
  EventService.$inject = ["$rootScope"];

  angular
    .module('app')
    .factory('EventService', EventService);
})();

(function() {
  'use strict';

  /**
   * @name icon
   * @description declarative svg icons
   * @ngInject
   */
  function icon($sce) {
    return {
      restrict: 'E',
      required: ['name'],
      scope: {
        name: '@',
        title: '@',
        size: '@'
      },
      // templateUrl: 'components/icon/icon.html',
      link: function(scope, element) {
        var svg = '',
            loader = '',
            titleHtml = '';

        element.addClass('Icon');

        if (scope.title) {
          titleHtml = '<title>' + scope.title + '</title>';
        }

        if (scope.name === 'loader') {
          // Can't seem to animate svg symbols
          element.addClass('Icon--loader');
          loader = '' +
            '<span class="Icon-item">' +
              '<span class="Icon--loader-dot"></span>' +
              '<span class="Icon--loader-dot"></span>' +
              '<span class="Icon--loader-dot"></span>' +
            '</span>';
          element.html($sce.trustAsHtml(loader));
        }
        else {
          // Stupid hack to make svg work
          svg = '' +
            '<svg class="Icon-item">' +
              '<use xlink:href="#Icon-' + scope.name + '" />' +
              titleHtml +
            '</svg>';
          element.html($sce.trustAsHtml(svg));
        }
      }
    };
  }
  icon.$inject = ["$sce"];

  angular
    .module('app')
    .directive('icon', icon);

})();

(function() {
  'use strict';

  /**
   * Handle locales related information.
   *
   * LocaleService.js
   * @ngInject
   */
  function LocaleService(UrlService, StringUtil, FilterUtil, $resource, _) {

    var locales = [];

    /**
     * Get project-version supported locales
     * @param projectSlug
     * @param versionSlug
     * @returns {$promise|*}
     */
    function getSupportedLocales(projectSlug, versionSlug) {

      var Locales = $resource(UrlService.LOCALE_LIST_URL, {}, {
        query: {
          method: 'GET',
          params: {
            projectSlug: projectSlug,
            versionSlug: versionSlug
          },
          isArray: true
        }
      });

      return Locales.query().$promise;
    }

    //Returns all locales supported in Zanata instance
    function getAllLocales() {
      var Locales = $resource(UrlService.ALL_LOCALE_URL, {}, {
        query: {
          method: 'GET',
          isArray: true
        }
      });
      return Locales.query().$promise.then(function(results) {
        locales = FilterUtil.cleanResourceList(results);
      });
    }

    function getUILocaleList() {
      var list = $resource(UrlService.uiTranslationListURL, {}, {
        query: {
          method: 'GET'
        }
      });

      return list.query().$promise;
    }

    function getLocaleByLocaleId(locales, localeId) {
      if(locales) {
        return _.find(locales, function(locale) {
          return StringUtil.equals(locale.localeId, localeId, true);
        });
      }
    }

    function containsLocale (locales, localeId) {
      return _.any(locales, function(locale) {
        return StringUtil.equals(locale.localeId, localeId, true);
      });
    }

    function getName(localeId) {
      var locale = getLocaleByLocaleId(locales, localeId);
      if(locale) {
        return locale.name;
      }
      return localeId;
    }

    return {
      getSupportedLocales : getSupportedLocales,
      getUILocaleList     : getUILocaleList,
      getLocaleByLocaleId : getLocaleByLocaleId,
      getAllLocales : getAllLocales,
      containsLocale : containsLocale,
      getName : getName,
      DEFAULT_LOCALE: {
        'localeId' : 'en-US',
        'name' : 'English'
      }
    };
  }
  LocaleService.$inject = ["UrlService", "StringUtil", "FilterUtil", "$resource", "_"];

  angular
    .module('app')
    .factory('LocaleService', LocaleService);
})();

(function() {

  'use strict';

  /**
   * @name logoLoader
   *
   * @description
   * Logo that is activated on global loading state
   *
   * @ngInject
   */
  function logoLoader(EventService) {
    return {
      restrict: 'EA',
      scope: {
        loading: '=',
        inverted: '='
      },
      link: function(scope) {
        scope.classes = '';

        scope.$on(EventService.EVENT.LOADING_START, function() {
          scope.classes += ' is-loading';
        });

        scope.$on(EventService.EVENT.LOADING_STOP, function() {
          scope.classes = scope.classes.replace('is-loading', '');
        });

        scope.$watch('inverted', function(newInverted) {
          if (newInverted) {
            scope.classes += ' LogoLoader--inverted';
          } else {
            scope.classes = scope.classes.replace('LogoLoader--inverted', '');
          }
        });
      },
      templateUrl: 'components/logo-loader/logo-loader.html'
    };
  }
  logoLoader.$inject = ["EventService"];

  angular
    .module('app')
    .directive('logoLoader', logoLoader);

})();

(function() {
  'use strict';

  /**
   * MessageHandler.js
   * @ngInject
   */
  function MessageHandler() {
    return {
      displayError: function(msg) {
        console.error(msg);
      },
      displayWarning: function(msg) {
        console.warn(msg);
      },
      displayInfo: function(msg) {
        console.info(msg);
      }
    };
  }

  angular
    .module('app')
    .factory('MessageHandler', MessageHandler);

})();

(function() {
  'use strict';

  /**
   * Handle notification in editor
   *
   * NotificationService.js
   * @ngInject
   */
  function NotificationService() {

  }

  angular
    .module('app')
    .factory('NotificationService', NotificationService);

})();

(function () {
  'use strict';

  /**
   * PhraseCache.js
   * Stores textflow, states in local cache.
   * TODO: use angular-data for storage
   * @ngInject
   */
  function PhraseCache($q, $resource, FilterUtil, UrlService, DocumentService,
                       _) {
    var phraseCache = this,
      states = {}, //ids and states of all tu in order
      transUnits = {};

    phraseCache.getStates =
      function (projectSlug, versionSlug, documentId, localeId) {
        var key = generateKey(projectSlug, versionSlug, documentId, localeId);
        if (_.has(states, key)) {
          return $q.when(states[key]);
        } else {
          var encodedDocId = DocumentService.encodeDocId(documentId);
          var methods = {
              query: {
                method: 'GET',
                params: {
                  projectSlug: projectSlug,
                  versionSlug: versionSlug,
                  docId: encodedDocId,
                  localeId: localeId
                },
                isArray: true
              }
            },
            States = $resource(UrlService.TRANSLATION_STATUS_URL, {}, methods);
          return States.query().$promise.then(function (state) {
            state = FilterUtil.cleanResourceList(state);
            states[key] = state;
            return states[key];
          });
        }
      };

    phraseCache.getTransUnits = function (ids, localeId) {
      var results = {},
        missingTUId = [],
        missingLocaleTUId = [];
      ids.forEach(function (id) {
        if (_.has(transUnits, id)) {
          if(transUnits[id][localeId]) {
            results[id] = transUnits[id];
          } else {
            missingLocaleTUId.push(id);
          }
        } else {
          missingTUId.push(id);
        }
      });
      if (_.isEmpty(missingTUId) && _.isEmpty(missingLocaleTUId)) {
        return $q.when(results);
      }
      else {
        var TextFlows, Translations;
        if(!_.isEmpty(missingTUId)) {
          TextFlows = $resource(UrlService.TEXT_FLOWS_URL, {}, {
            query: {
              method: 'GET',
              params: {
                localeId: localeId,
                ids: missingTUId.join(',')
              }
            }
          });
        }
        if(!_.isEmpty(missingLocaleTUId)) {
          Translations = $resource(UrlService.TRANSLATION_URL, {}, {
            query: {
              method: 'GET',
              params: {
                localeId: localeId,
                ids: missingLocaleTUId.join(',')
              }
            }
          });
        }

        //need to create chain of promises
        if(TextFlows && Translations) {
          return TextFlows.query().$promise.then(updateCacheWithNewTU).
            then(Translations.query().$promise.then(updateCacheWithExistingTU));
        } else if(TextFlows) {
          return TextFlows.query().$promise.then(updateCacheWithNewTU);
        } else if(Translations) {
          return Translations.query().$promise.then(updateCacheWithExistingTU);
        }
      }

      function updateCacheWithExistingTU(newTransUnits) {
        newTransUnits = FilterUtil.cleanResourceMap(newTransUnits);
        for (var key in newTransUnits) {
          //push to cache
          transUnits[key][localeId] = newTransUnits[key][localeId];
          results[key] = transUnits[key]; //merge with results
        }
        return results;
      }

      function updateCacheWithNewTU(newTransUnits) {
        newTransUnits = FilterUtil.cleanResourceMap(newTransUnits);
        for (var key in newTransUnits) {
          transUnits[key] = newTransUnits[key]; //push to cache
          results[key] = transUnits[key]; //merge with results
        }
        return results;
      }
    };

    /**
     * On translation updated from server
     * @param id
     * @param localeId
     * @param revision
     * @param state
     * @param content
     * @param contents
     */
    phraseCache.onTransUnitUpdated =
      function (context, id, localeId, revision, status, phrase) {

        var key = generateKey(context.projectSlug, context.versionSlug,
          context.docId, localeId);

        var stateEntry = _.find(states[key], function(stateEntry) {
          return stateEntry.id === id;
        });
        //Update states cache
        if(stateEntry) {
          stateEntry.state = status;
        }

        //Update transUnits cache
        var translation = transUnits[id][localeId];
        if (!translation) {
          translation = {};
        }
        translation.revision = parseInt(revision);
        translation.state = status;
        translation.contents = phrase.newTranslations.slice();
      };

    function generateKey(projectId, versionId, documentId, localeId) {
      return projectId + '-' + versionId + '-' +
        documentId + '-' + localeId;
    }

    return phraseCache;
  }
  PhraseCache.$inject = ["$q", "$resource", "FilterUtil", "UrlService", "DocumentService", "_"];

  angular
    .module('app')
    .factory('PhraseCache', PhraseCache);

})();

(function () {
  'use strict';

  /**
   * @typedef {Object} Phrase
   * @property {number} id text flow id
   * @property {string[]} sources source contents
   * @property {string[]} translations original translation
   * @property {string[]} newTranslations translations in the editor
   * @property {boolean} plural whether it's in plural form
   * @property {StatusInfo} status information about this phrase
   * @property {number} revision translation revision number
   * @property {number} wordCount source word count
   */
  /**
   * @name PhraseService
   * @description Provides a list of phrases for the current document(s)
   *
   * @ngInject
   */
  function PhraseService(FilterUtil, PhraseCache, TransStatusService, _,
                         $stateParams) {
    var phraseService = {};

    phraseService.phrases = []; //current displayed phrases

    // FIXME use an object for all the ID arguments - in general we will only
    // need to modify such an object sporadically when switching document
    // or locale, and it is neater than passing them all
    // around separately.

    phraseService.getPhraseCount = function(context, filter) {
      return PhraseCache.getStates(context.projectSlug, context.versionSlug,
        context.docId, context.localeId).then(function(states) {
          var ids = getIds(states, filter.status);
          return ids.length;
        });
    };

    /**
     * Fetch each of the text flows appearing in the given states data.
     */
    phraseService.fetchAllPhrase = function (context, filter,
                                             offset, maxResult) {

      var localeId = context.localeId;

      return PhraseCache.getStates(context.projectSlug, context.versionSlug,
        context.docId, localeId).then(getTransUnits);

      function getTransUnits(states) {
        var ids = getIds(states, filter.status);
        if (!isNaN(offset)) {
          if(!isNaN(maxResult)) {
            ids = ids.slice(offset, offset + maxResult);
          } else {
            ids = ids.slice(offset);
          }
        }
        // Reading for chaining promises https://github.com/kriskowal/q
        // (particularly "Sequences").
        return PhraseCache.getTransUnits(ids, localeId).
          then(transformToPhrases).then(sortPhrases);
      }

      /**
       * Converts text flow data from the API into the form expected in the
       * editor.
       *
       * @returns {Phrase[]}
       */
      function transformToPhrases(transUnits) {
        return _.map(transUnits, function(transUnit, id) {
          var source = transUnit.source,
              trans = transUnit[localeId];
          return {
            id: parseInt(id),
            sources: source.plural ? source.contents : [source.content],
            // Original translation
            translations: extractTranslations(source, trans),
            // Translation from editor
            newTranslations: extractTranslations(source, trans),
            plural: source.plural,
            // Conform the status from the server, return an object
            status: trans ? TransStatusService.getStatusInfo(trans.state) :
              TransStatusService.getStatusInfo('untranslated'),
            revision: trans ? parseInt(trans.revision) : 0,
            wordCount: parseInt(source.wordCount)
          };
        });
      }

      function extractTranslations(source, trans) {
        if(source.plural) {
          return trans && trans.contents ? trans.contents.slice() : [];
        }
        return trans ? [trans.content] : [];
      }

      function sortPhrases(phrases) {
        return PhraseCache.getStates(context.projectSlug, context.versionSlug,
          context.docId, localeId).then(function(states) {
            phraseService.phrases = _.sortBy(phrases, function(phrase) {
              var index = _.findIndex(states, function(state) {
                return state.id === phrase.id;
              });
              return index >= 0 ? index : phrases.length;
            });
            return phraseService.phrases;
          });
      }
    };

    //update phrase,statuses and textFlows with given tu id
    phraseService.onTransUnitUpdated = function(context, id, localeId, revision,
      status, phrase) {

      PhraseCache.onTransUnitUpdated(context, id, localeId, revision, status,
        phrase);

      var cachedPhrase = findPhrase(id, phraseService.phrases);
      //update phrase if found
      if(cachedPhrase) {
        cachedPhrase.translations = phrase.newTranslations.slice();
        cachedPhrase.revision = revision;
        cachedPhrase.status = TransStatusService.getStatusInfo(status);
      }
    };

    //rollback content of phrase
    phraseService.onTransUnitUpdateFailed = function(id) {
      var phrase = findPhrase(id, phraseService.phrases);
      if(phrase) {
        phrase.newTranslations = phrase.translations.slice();
      }
    };

    // find next Id from phrases states
    phraseService.findNextId = function(currentId) {
      return PhraseCache.getStates($stateParams.projectSlug,
                                   $stateParams.versionSlug, $stateParams.docId,
                                   $stateParams.localeId)
        .then(function (states) {
          var currentIndex,
            nextIndex;
          currentIndex = _.findIndex(states, function (state) {
            return state.id === currentId;
          });
          nextIndex = currentIndex + 1 < states.length ?
            currentIndex + 1 : states.length - 1;
          return states[nextIndex].id;
        });
    };

    // find previous id from phrases states
    phraseService.findPreviousId = function(currentId) {
      return PhraseCache.getStates($stateParams.projectSlug,
                                   $stateParams.versionSlug, $stateParams.docId,
                                   $stateParams.localeId)
        .then(function (states) {
          var currentIndex,
            previousIndex;
          currentIndex = _.findIndex(states, function (state) {
            return state.id === currentId;
          });
          previousIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : 0;
          return states[previousIndex].id;
        });
    };

    // find next phrase with requested status
    phraseService.findNextStatus = function(currentId, status) {
      return PhraseCache.getStates($stateParams.projectSlug,
                                   $stateParams.versionSlug, $stateParams.docId,
                                   $stateParams.localeId)
        .then(function (statusList) {
          var currentIndex,
            nextStatusInfo,
            requestStatus = TransStatusService.getStatusInfo(status);

          currentIndex = _.findIndex(statusList, function (state) {
            return state.id === currentId;
          });

          for (var i = currentIndex + 1; i < statusList.length; i++) {
            nextStatusInfo = TransStatusService.getStatusInfo(
              statusList[i].state);
            if (nextStatusInfo.ID === requestStatus.ID) {
              return statusList[i].id;
            }
          }
          return currentId;
        });
    };

    function findPhrase(id, phrases) {
      return _.find(phrases, function(phrase) {
        return phrase.id === id;
      });
    }

    function getIds(resources, states) {
      if(states) {
        resources = FilterUtil.filterResources(resources, ['status'], states);
      }
      return _.map(resources, function (item) {
        return item.id;
      });
    }

    // Does not appear to be used anywhere. Removing until phrase-caching code
    // is added.
    // phraseService.findById = function(phraseId) {
    //   var deferred = $q.defer();
    //   var phrase = phrases[phraseId];
    //   deferred.resolve(phrase);
    //   return deferred.promise;
    // };

    return phraseService;
  }
  PhraseService.$inject = ["FilterUtil", "PhraseCache", "TransStatusService", "_", "$stateParams"];

  angular
    .module('app')
    .factory('PhraseService', PhraseService);

})();


(function() {
  'use strict';

  /**
   * @name progressbar
   * @description progressbar container
   * @ngInject
   */
  function progressbar() {
    return {
      restrict: 'E',
      required: 'progressbarStatistic',
      scope: {
        statistic: '=progressbarStatistic',
        size: '@' //large, full, or empty
      },
      templateUrl: 'components/progressbar/progressbar.html',
      controller: ["$scope", function($scope) {
        /**
         * Need to set to true for complex object watch. Performance issue.
         * https://docs.angularjs.org/api/ng/type/$rootScope.Scope
         */
        $scope.$watch('statistic', function(statistic) {
          if (statistic) {
            $scope.style = getStyle(statistic);
          }
        }, true);
      }]
    };
  }

  function getStyle(statistic) {
    var total = statistic.total,
        widthApproved = getWidthPercent(statistic.approved, total),
        widthTranslated = getWidthPercent(statistic.translated, total),
        marginLeftTranslated = widthApproved,
        widthNeedsWork = getWidthPercent(statistic.needswork, total),
        marginLeftNeedsWork = widthApproved + widthTranslated,
        widthUntranslated = getWidthPercent(statistic.untranslated, total),
        marginLeftUntranslated = widthApproved +
          widthTranslated + widthNeedsWork,
        style = {};

    style.approved = {
      'width': widthApproved + '%',
      'marginLeft': 0
    };
    style.translated = {
      'width': widthTranslated + '%',
      'marginLeft': marginLeftTranslated + '%'
    };
    style.needsWork = {
      'width': widthNeedsWork + '%',
      'marginLeft': marginLeftNeedsWork + '%'
    };
    style.untranslated = {
      'width': widthUntranslated + '%',
      'marginLeft': marginLeftUntranslated + '%'
    };
    return style;
  }

  function getWidthPercent(value, total) {
    var percent = 0;
    if (value) {
      percent = value / total * 100;
    }
    return percent;
  }

  angular
    .module('app')
    .directive('progressbar', progressbar);

})();

(function() {
  'use strict';

  /**
   * Handle communication with server on Project related information.
   * ProjectService.js
   * @ngInject
   */

  function ProjectService(UrlService, $resource) {

    /**
     * Get project's information
     *
     * @param projectSlug
     * @returns {$promise|*|N.$promise}
     */
    function getProjectInfo(projectSlug) {
      var methods = {
          query: {
            method: 'GET',
            params: {
              projectSlug: projectSlug
            }
          }
        };

      var Locales = $resource(UrlService.PROJECT_URL, {}, methods);
      return Locales.query().$promise;
    }

    return {
      getProjectInfo: getProjectInfo
    };
  }
  ProjectService.$inject = ["UrlService", "$resource"];
  angular
    .module('app')
    .factory('ProjectService', ProjectService);
})();

(function() {
  'use strict';

  /**
   * @name display-character
   * @description display whitespace character with symbol(HTML),
   *              *NOTE*, need to wrap around <pre> tag
   * @ngInject
   */
  function renderWhitespaceCharacters() {
    var WHITESPACES = {
      'space' : {
        'regex' : / /g,
        'template' : '<span class="u-textSpace"> </span>'
      },
      'newline' : {
        'regex' : /\n/g,
        'template' : '<span class="u-textPilcrow"></span>\n'
      },
      'tab' : {
        'regex' : /\t/g,
        'template' : '<span class="u-textTab">\t</span>'
      }
    };

    return {
      restrict: 'A',
      required: ['ngBind'],
      scope: {
        ngBind: '='
      },

      link: function compile(scope, element) {
        scope.$watch('ngBind', function (value) {
          value = replaceChar(value, WHITESPACES.space);
          value = replaceChar(value, WHITESPACES.newline);
          value = replaceChar(value, WHITESPACES.tab);
          element.html(value);
        });
      }
    };

    function replaceChar(value, whitespaceChar) {
      return value.replace(whitespaceChar.regex, whitespaceChar.template);
    }
  }

  angular
    .module('app')
    .directive('renderWhitespaceCharacters', renderWhitespaceCharacters);

})();

(function() {
  'use strict';

  /**
   * Represents a draggable resizer.
   *
   * @param $window
   * @param $document
   * @param $timeout
   * @returns {Function}
   */
  function resizer(SettingsService, $window, $document, $timeout) {

    function link(scope, element, attrs) {

      /**
       * The height to use for the resizer when it is visible.
       *
       * @type {Number}
       */
      scope.height = parseInt(attrs.resizerHeight);

      /**
       * The current height of the resizer to display.
       *
       * @type {Number}
       */
      scope.actualHeight = scope.height;

      scope.position = normalisePercentage(SettingsService.get(
        SettingsService.SETTING.SUGGESTIONS_PANEL_HEIGHT), $window.innerHeight);
      scope.actualPosition = scope.position;

      scope.show =
        SettingsService.subscribe(SettingsService.SETTING.SHOW_SUGGESTIONS,
        function (show) {
          scope.show = show;
          setBottomPanelVisibility(show);
        });

      /**
       * Persist the current size as a setting.
       */
      function saveCurrentSize() {
        SettingsService.update(SettingsService.SETTING.SUGGESTIONS_PANEL_HEIGHT,
          scope.actualPosition);
      }

      function setBottomPanelVisibility(showing) {
        if (showing) {
          scope.actualPosition = scope.position;
          scope.actualHeight = scope.height;
        } else {
          // save resizer position so it can be restored
          // does not appear to set properly without an intermediate variable
          var currentPos = scope.actualPosition;
          scope.position = currentPos;
          scope.actualPosition = 0;
          scope.actualHeight = 0;
        }

        // Panel only renders properly if resizer is adjusted in a later frame
        setTimeout(adjustResizer);
      }

      setBottomPanelVisibility(scope.show);

      element.addClass('Resizer');

      // Initial Resize
      if (attrs.resizer === 'vertical') {
        element.addClass('Resizer--vertical');
        $timeout(function (){
          adjustVerticalPanel(scope.actualPosition);
        });
      }
      else {
        element.addClass('Resizer--horizontal');
        $timeout(function (){
          adjustHorizontalPanel(scope.actualPosition);
        });
      }

      element.on('mousedown', function(event) {
        event.preventDefault();
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      angular.element($window).bind('resize', function() {
        $timeout.cancel(scope.resizing);
        scope.resizing = $timeout(adjustResizer);
      });

      function mousemove(event) {
        if (attrs.resizer === 'vertical') {
          adjustVerticalPanel(event.pageX);
        } else {
          adjustHorizontalPanel($window.innerHeight - event.pageY);
        }
      }

      function adjustVerticalPanel(resizerPositionX) {
        var x = resizerPositionX,
            leftPanel = angular.element(document
              .querySelector(attrs.resizerLeft)),
            rightPanel = angular.element(document
              .querySelector(attrs.resizerRight)),
            maximumPanelSize =
              normalisePercentage(attrs.resizerMax, $window.innerHeight),
            minimumPanelSize = attrs.resizerMin ||
              parseInt(attrs.resizerWidth);

        scope.actualPosition = x;
        x = restrictMinOrMax(x, maximumPanelSize, minimumPanelSize);

        element.css({
          left: (x - (scope.actualHeight / 2))  + 'px'
        });

        leftPanel.css({
          width: x + 'px'
        });

        rightPanel.css({
          left: x + 'px'
        });
      }

      function adjustHorizontalPanel(resizerPositionY) {
        var y = resizerPositionY,
            topPanel = angular.element(document
              .querySelector(attrs.resizerTop)),
            bottomPanel = angular.element(document
              .querySelector(attrs.resizerBottom)),
            maximumPanelSize =
              normalisePercentage(attrs.resizerMax, $window.innerHeight),
            minimumPanelSize = attrs.resizerMin || scope.actualHeight;

        scope.actualPosition = y;
        y = restrictMinOrMax(y, maximumPanelSize, minimumPanelSize);

        element.css({
          bottom: (y - (scope.actualHeight / 2))  + 'px'
        });

        topPanel.css({
          bottom: y + 'px'
        });

        bottomPanel.css({
          height: y + 'px'
        });
      }

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);

        // Now that a new value has stopped rapidly changing, persist it.
        saveCurrentSize();
      }

      function adjustResizer() {
        if (attrs.resizer === 'vertical') {
          adjustVerticalPanel(scope.actualPosition);
        }
        else {
          adjustHorizontalPanel(scope.actualPosition);
        }
      }

      function restrictMinOrMax(currentSize, maxSize, minSize) {
        // Maximum
        if (maxSize && currentSize > maxSize) {
          return maxSize;
        }
        // Minimum
        else if (currentSize < minSize) {
          return minSize;
        }
        else {
          return currentSize;
        }
      }

      function normalisePercentage(fraction, whole) {
        if ((/[0-9]*\.?[0-9]+%/).test(fraction)) {
          return Math.round(whole * (parseInt(fraction.replace('%','')) / 100));
        }
        else {
          return parseInt(fraction);
        }
      }

    }

    return {
      link: link
    };
  }
  resizer.$inject = ["SettingsService", "$window", "$document", "$timeout"];

  angular
    .module('app')
    .directive('resizer', resizer);

})();

(function() {
  'use strict';

  /**
   * @name ScrollbarWidthCtrl
   *
   * @description
   * Handle dropdown events between directives
   *
   * @ngInject
   */
  function ScrollbarWidthCtrl() {
    var scrollbarWidthCtrl = this;

    scrollbarWidthCtrl.init = function() {
      var container = scrollbarWidthCtrl.container[0],
          child = scrollbarWidthCtrl.child[0],
          scrollbarWidth = child.offsetWidth - container.offsetWidth;

      scrollbarWidthCtrl.width = scrollbarWidth / 2;
    };

  }

  angular
    .module('app')
    .controller('ScrollbarWidthCtrl', ScrollbarWidthCtrl);

})();

(function() {
  'use strict';

  /**
   * @name scrollbarWidth
   *
   * @description
   * Scrollbar width container
   * Needed for the controller to reference all properties
   */
  function scrollbarWidth() {
    return {
      restrict: 'A',
      controller: 'ScrollbarWidthCtrl as scrollbarWidthCtrl',
      link: function(scope, element, attrs, scrollbarWidthCtrl) {
        scrollbarWidthCtrl.init(element);
      }
    };
  }

  /**
   * @name scrollbarWidthElement
   *
   * @description
   * The element to add the scrollbar width to
   */
  function scrollbarWidthElement() {
    return {
      restrict: 'A',
      require: '?^scrollbarWidth',
      link: function(scope, element, attrs, scrollbarWidthCtrl) {
        if (!scrollbarWidthCtrl) {
          return;
        }
        // Use the attribute to decide which property to set
        element.css(attrs.scrollbarWidthElement, scrollbarWidthCtrl.width);
      }
    };
  }

  /**
   * @name scrollbarWidthContainer
   *
   * @description
   * Get the scrollbar container width
   */
  function scrollbarWidthContainer() {
    return {
      restrict: 'A',
      require: '?^scrollbarWidth',
      link: function(scope, element, attrs, scrollbarWidthCtrl) {
        if (!scrollbarWidthCtrl) {
          return;
        }
        scrollbarWidthCtrl.container = element;
      }
    };
  }

  /**
   * @name scrollbarWidthChild
   *
   * @description
   * Get the scrollbar child width
   */
  function scrollbarWidthChild() {
    return {
      restrict: 'A',
      require: '?^scrollbarWidth',
      link: function(scope, element, attrs, scrollbarWidthCtrl) {
        if (!scrollbarWidthCtrl) {
          return;
        }
        scrollbarWidthCtrl.child = element;
      }
    };
  }

  angular
    .module('app')
    .directive('scrollbarWidth', scrollbarWidth)
    .directive('scrollbarWidthElement', scrollbarWidthElement)
    .directive('scrollbarWidthContainer', scrollbarWidthContainer)
    .directive('scrollbarWidthChild', scrollbarWidthChild);

})();

(function() {
  'use strict';


  /**
   * The name of a setting, used as a unique key for lookup and storage.
   * @typedef {string} SettingKey
   */

  /**
   * The value for a setting.
   *
   * @typedef {(string|number|boolean)} SettingValue
   */

  /**
   * Service for persisted user settings.
   *
   * @constructor
   */
  function SettingsService(EventService, $q, $rootScope, _) {
    var settingsService = this;

    /**
     * All valid settings keys.
     *
     * These enum constants should be used for all settings operations.
     *
     * @type {Object<*, SettingKey>}
     */
    settingsService.SETTING = {
      SUGGESTIONS_AUTOFILL_ON_ROW_SELECT: 'suggestionsAutofillOnRowSelect',
      SUGGESTIONS_SHOW_DIFFERENCE: 'suggestionsShowDifference',
      SHOW_SUGGESTIONS: 'showSuggestions',
      SUGGESTIONS_PANEL_HEIGHT: 'suggestionsPanelHeight'
    };

    var SETTING = settingsService.SETTING;

    /**
     * Settings enum, with default values that indicate the type
     * @enum {SettingValue}
     */
    var defaultSettings = {};
    defaultSettings[SETTING.SUGGESTIONS_AUTOFILL_ON_ROW_SELECT] = true;
    defaultSettings[SETTING.SUGGESTIONS_SHOW_DIFFERENCE] = false;
    defaultSettings[SETTING.SHOW_SUGGESTIONS] = true;
    defaultSettings[SETTING.SUGGESTIONS_PANEL_HEIGHT] = '30%';

    /**
     * Local settings cache.
     *
     * @type {Object<SettingKey, SettingValue>}
     */
    var settings = _.clone(defaultSettings);


    /*

     TODO save settings to the server, prefer sending as a batch if possible
     (i.e. when updateAll is used, and future option to ensure only one save
      request at a time and use _.extend to combine all the queued settings
      while waiting).

    */

    /**
     * Update a single setting to have the given value.
     *
     * This will trigger a user setting update event.
     *
     * @param {SettingKey} setting the name of the setting to update
     * @param {SettingValue} value the new value for the setting
     */
    function update(setting, value) {
      validateSettingValue(value);
      var settingObj = {};
      settingObj[setting] = value;
      _.extend(settings, settingObj);

      EventService.emitEvent(EventService.EVENT.USER_SETTING_CHANGED, {
        setting: setting,
        value: value
      });
    }

    /**
     * Update multiple settings from a map of setting names and values.
     *
     * An event is triggered for each setting.
     *
     * @param {Object<SettingKey, SettingValue>} settings
     */
    function updateAll(settings) {
      _.each(settings, function (value, key) {
        update(key, value);
      });
    }

    /**
     * Get the currently stored value for a setting.
     *
     * This should only be used to fetch the initial value or when a setting
     * is used once. To track changes to a setting, subscribe to the
     * USER_SETTING_CHANGED event and check the setting property of the event
     * payload.
     *
     * @param {SettingKey} setting name of the setting to look up
     */
    function get(setting) {
      if (_.has(settings, setting)) {
        return settings[setting];
      }
      // Incorrect key is a programmer error - default should be set for all
      // user settings that are used.
      console.error('Tried to look up setting with unrecognized key: %s',
        setting);
    }

    /**
     * Register an action to perform when a user setting value changes, and get
     * the current value.
     *
     * @param {SettingKey} setting the setting to get and subscribe to
     * @param {function<SettingValue>} callback called with the new value
     * @return {SettingValue} the current value of the setting
     */
    function subscribe(setting, callback) {
      $rootScope.$on(EventService.EVENT.USER_SETTING_CHANGED,
        function (event, data) {
          if (data.setting === setting) {
            callback(data.value);
          }
        });
      return get(setting);
    }

    /**
     * Throw an error if the value is not the correct type for the setting.
     *
     * @param {SettingValue} value
     */
    function validateSettingValue(value) {
      switch (typeof value) {
        case 'boolean':
        case 'number':
        case 'string':
          break;
        default:
          throw new Error('Invalid type for setting value: "' + typeof value +
            '".');
      }
    }



    return {
      SETTING: SETTING,
      update: update,
      updateAll: updateAll,
      get: get,
      subscribe: subscribe
    };
  }
  SettingsService.$inject = ["EventService", "$q", "$rootScope", "_"];

  angular
    .module('app')
    .factory('SettingsService', SettingsService);
})();

(function() {
  'use strict';

  /**
   * PhraseSuggestionsService.js
   * @ngInject
   */
  function PhraseSuggestionsService(_, EventService, SuggestionsService,
                                    $timeout, $rootScope) {
    // TODO extract common code from TextSuggestionsService and here

    /* Minimum time in milliseconds to wait between requesting results */
    var DELAY = 300;
    var MAX_ACTIVE_REQUESTS = 3;

    /* @type {boolean} */
    var loading = false;

    /* @type {Phrase} */
    var searchPhrase = null;

    /* @type {Array<Suggestion>} */
    var results = [];

    /**
     * @return {boolean} true if results have been requested and not delivered
     */
    function isLoading() {
      return loading;
    }

    /**
     *
     * @return {string[]} strings that were used to search, or null if no search
     *                    has been performed.
     */
    function getSearchStrings() {
      return searchPhrase ? searchPhrase.sources : [];
    }

    /**
     * Get results for the current search
     * @return {Array<Suggestion>} results for the current search. Empty if
     *                             no search has been performed.
     */
    function getResults() {
      return results;
    }




    var pendingSearchHandle = null;

    /* Number of requests that are in progress */
    var activeRequests = 0;
    /* Time that most recent search was started */
    var latestSearchTimestamp = Date.now();
    var latestResultsTimestamp = Date.now();

    /* Search data for a pending search. Will be overwritten whenever a new
     * search is queued */
    var pendingSearch = null;

    /**
     * Make this the next search that will occur when a search is eligible, and
     * ensure that an appropriate timer is running to initiate the pending
     * search.
     *
     * @param {Phrase} searchPhrase
     */
    function deferSearch(searchPhrase) {
      pendingSearch = searchPhrase;
      if (pendingSearchHandle) {
        // timer is already running, no need to start
        return;
      }

      // no timer yet, start one
      waitToRunPendingSearch();
    }

    function waitToRunPendingSearch() {
      var eligibleSearchTime = latestSearchTimestamp + DELAY;
      var timeUntilCanSearch = eligibleSearchTime - Date.now();

      var delay = timeUntilCanSearch > 0 ? timeUntilCanSearch : DELAY;

      pendingSearchHandle = $timeout(function () {
        pendingSearchHandle = null;

        if (activeRequests >= MAX_ACTIVE_REQUESTS) {
          // too many requests, keep waiting
          waitToRunPendingSearch();
          return;
        }

        // run the actual search
        runPendingSearch();
      }, delay);
    }

    /**
     * Initiate the pending search, and set appropriate variables.
     */
    function runPendingSearch() {
      if (pendingSearch === null) {
        // no pending search, skip
        return;
      }

      var search = pendingSearch;
      pendingSearch = null;
      $timeout.cancel(pendingSearchHandle);
      pendingSearchHandle = null;

      searchByPhrase(search);
    }

    /**
     * Perform a search, and set appropriate variables.
     *
     * @param {Phrase} phrase
     */
    function searchByPhrase(phrase) {
      searchPhrase = phrase;
      var timestamp = Date.now();
      latestSearchTimestamp = timestamp;
      activeRequests++;

      // Run the search and notify listeners when it is done
      SuggestionsService.getSuggestionsForPhrase(phrase).then(
        function (suggestions) {
          // Only update results if this search is more recent than the
          // current results.
          if (timestamp > latestResultsTimestamp) {
            latestResultsTimestamp = timestamp;
            results = suggestions;
          }
        },
        function (error) {
          console.error('Error searching for phrase ', error);
        }).finally(function () {
          activeRequests--;
          $rootScope.$broadcast('PhraseSuggestionsService:updated');
          if (activeRequests < MAX_ACTIVE_REQUESTS) {
            runPendingSearch();
          }
        });
    }


    $rootScope.$on(EventService.EVENT.REQUEST_PHRASE_SUGGESTIONS,
      function (event, wrapper) {
        /* @type {Phrase} */
        var data = wrapper.phrase;

        if (pendingSearch && pendingSearch.id === data.id) {
          // search already pending
          return;
        }

        if (!pendingSearch && activeRequests === 0 && searchPhrase &&
            searchPhrase.id === data.id) {
          // search is identical and there are no other searches to replace it
          return;
        }

        if (activeRequests >= MAX_ACTIVE_REQUESTS) {
          // too many requests, queue this one instead
          deferSearch(data);
          return;
        }

        var eligibleSearchTime = latestSearchTimestamp + DELAY;

        if (Date.now() < eligibleSearchTime) {
          // Too early to search, defer the search
          deferSearch(data);
          return;
        }

        results = [];
        $rootScope.$broadcast('PhraseSuggestionsService:updated');
        searchByPhrase(data);
      });

    return {
      isLoading: isLoading,
      getSearchStrings: getSearchStrings,
      getResults: getResults
    };
  }
  PhraseSuggestionsService.$inject = ["_", "EventService", "SuggestionsService", "$timeout", "$rootScope"];

  angular
    .module('app')
    .factory('PhraseSuggestionsService', PhraseSuggestionsService);
})();

(function () {
  'use strict';

  /**
   * SuggestionCtrl.js
   * @ngInject
   */
  function SuggestionCtrl(EventService, $rootScope, $scope, _, $timeout) {
    var suggestionCtrl = this;

    suggestionCtrl.copyButtonText = 'Copy Translation';

    while ($scope.search.length < $scope.suggestion.sourceContents.length) {
      $scope.search.push('');
    }

    /**
     * Get a modifier for the row class that will determine display colours.
     *
     * Intended to be used to generate css class for the row:
     *
     *     TransUnit--{{suggestionCtrl.rowDisplayType()}}
     *
     * @return {string} modifier to append to the TransUnit-- css class
     */

    suggestionCtrl.rowDisplayType = function () {
      /* @type {MatchDetail} */
      var topMatch = suggestionCtrl.topMatch();

      if (topMatch.type === 'IMPORTED_TM') {
        return 'secondary';
      }
      if (topMatch.type === 'LOCAL_PROJECT') {
        if (topMatch.contentState === 'Translated') {
          return 'success';
        }
        if (topMatch.contentState === 'Approved') {
          return 'highlight';
        }
      }
      console.error('Unable to generate row display type for top match');
    };

    /**
     *
     * @returns {string}
     */
    suggestionCtrl.percentDisplayType = function () {
      var type = suggestionCtrl.rowDisplayType();
      return type.charAt(0).toUpperCase() + type.substring(1);
    };

    /**
     * Return correct percentage to display.
     *
     * I am using this instead of Angular's number display because the number
     * display forces a particular number of decimal places rather than just
     * limiting to the specified number, and because we should never show 100%
     * unless it is exactly 100%.
     */
    suggestionCtrl.percent = function () {
      var percent = $scope.suggestion.similarityPercent;

      // Prevent very high percentages displaying as 100%
      if (percent > 99.99 && percent < 100) {
        return '99.99';
      }
      if (percent >= 99.90 && percent < 100) {
        return '99.9';
      }

      // Limit any inexact percentages to a single decimal place
      if (Math.round(percent) !== percent) {
        return percent.toFixed(1);
      }

      return percent;
    };

    /**
     * Return the details for the best match according to the following
     * criteria:
     *
     *  - Content state and type: Approved > Translated > Imported
     *  - Last modified: older modifications take higher priority.
     *
     * @return {MatchDetail} the best match
     */
    suggestionCtrl.topMatch = function () {
      return $scope.sortedDetails[0];
    };

    // TODO use sortByAll when lodash version is increased
    /**
     * Return a string that will naturally sort local project details before
     * imported TM details, approved state above translated state, and older
     * modification dates first, in that priority order.
     *
     * @param detail {MatchDetail} to generate a sorting string for
     * @returns {string}
     */
    function typeAndDateSort (detail) {

      if (detail.type === 'IMPORTED_TM') {
        return '3' + detail.lastChanged;
      }
      if (detail.type === 'LOCAL_PROJECT') {
        if (detail.contentState === 'Translated') {
          return '2' + detail.lastModifiedDate;
        }
        if (detail.contentState === 'Approved') {
          return '1' + detail.lastModifiedDate;
        }
      }
      // Unrecognized, sort last
      return '9';
    }

    suggestionCtrl.showSuggestionCopied = function () {
      suggestionCtrl.copyButtonText = 'Copied';
      suggestionCtrl.copyButtonDisabled = true;
      $timeout(function() {
        suggestionCtrl.copyButtonDisabled = false;
        suggestionCtrl.copyButtonText = 'Copy Translation';
      }, 500);
    };

    /**
     * Request this suggestion to be copied to the selected translation field.
     *
     * Generates a COPY_FROM_SUGGESTION event.
     */
    suggestionCtrl.copySuggestion = function () {
      suggestionCtrl.showSuggestionCopied();
      EventService.emitEvent(EventService.EVENT.COPY_FROM_SUGGESTION,
        { suggestion: $scope.suggestion });
    };

    $scope.$on('EditorSuggestionsCtrl:nth-suggestion-copied',
      function (event, index) {
        if (index === $scope.index) {
          suggestionCtrl.showSuggestionCopied();
        }
    });

    // TODO sort detail before it is sent here for display
    $scope.sortedDetails =
      _.sortBy($scope.suggestion.matchDetails, typeAndDateSort);


    // Will be undefined for imported matches
    $scope.translator = suggestionCtrl.topMatch().lastModifiedBy;


    return suggestionCtrl;
  }
  SuggestionCtrl.$inject = ["EventService", "$rootScope", "$scope", "_", "$timeout"];

  angular
    .module('app')
    .controller('SuggestionCtrl', SuggestionCtrl);
})();


(function() {
  'use strict';

  /**
   * @typedef {Object} ImportedMatchDetail
   * @param {string} type - 'IMPORTED_TM'
   * @param {number} transMemoryUnitId - numeric identifier for this translation
   *                         memory unit on the server
   * @param {string} transMemorySlug - identifier for the translation memory
   *                         that contains this translation unit
   * @param {string} transUnitId - optional identifier for this translation unit
   * @param {string} lastChanged - date that this text flow was last changed, in
   *                         ISO-8601 format
   */

  /**
   * @typedef {Object} LocalMatchDetail
   * @param {string} type - 'LOCAL_PROJECT'
   * @param {number} textFlowId - numeric identifier for this text flow on the
   *                         server
   * @param {string} contentState - 'Translated' or 'Approved'
   * @param {string} projectId - identifier for the project that this text flow
   *                         is in
   * @param {string} projectName - display name for the project that this text
   *                         flow is in
   * @param {string} version - identifier for the version that this text flow is
   *                         in
   * @param {string} documentPath - file path of the document that contains this
   *                         text flow.
   * @param {string} documentName - file name of the document that contains this
   *                         text flow, without the file path
   * @param {string} resId - natural id for this text flow within the document
   * @param {string} lastModifiedDate - date that this text flow was last
   *                         changed, in ISO-8601 format
   * @param {string} lastModifiedBy - username of the user who last modified
   *                         this text flow
   */

  /**
   * @typedef {(ImportedMatchDetail|LocalMatchDetail)} MatchDetail
   */

  /**
   * @typedef {Object} Suggestion
   * @param {number} relevanceScore - score from the search engine indicating
   *                         how close a match it considers this to the query.
   *                         It is sensible to compare scores within a query,
   *                         but not between queries.
   * @param {number} similarityPercent - proportion of the characters in
   *                         sourceContents that match the query
   * @param {Array<string>} sourceContents - suggested source text that is
   *                                similar to the search
   * @param {Array<string>} targetContents - translations of the suggested
   *                                source text
   * @param {Array<MatchDetail>} matchDetails - summary of all the sources with
   *                                     the same source and target contents
   */

  /**
   * Provide suggestions based on given source text.
   *
   * SuggestionsService.js
   * @ngInject
   */
  function SuggestionsService(EditorService, EventService, UrlService,
                              $resource) {

    /**
     * Get a list of suggestions for how to translate a piece of text.
     *
     * @param {string} searchText
     * @return {Promise<Array<Suggestion>>} suggestions for translating the
     *                                      given text
     */
    function getSuggestionsForText(searchText) {
      return getSuggestionsForContents([searchText]);
    }

    /**
     * Get a list of suggestions for how to translate a phrase.
     *
     * @param {Phrase} phrase the source text to find suggestions for
     * @returns {Promise<Array<Suggestion>>} suggestions for translating the
     *                                       given phrase
     */
    function getSuggestionsForPhrase(phrase) {
      return getSuggestionsForContents(phrase.sources)
        .then(function (suggestions) {
          EventService.emitEvent(EventService.EVENT.PHRASE_SUGGESTION_COUNT,
            { id: phrase.id, count: suggestions.length });
          return suggestions;
        });
    }

    /**
     * Get a list of suggestions for how to translate a list of strings.
     *
     * @param contents {Array<string>} source strings to find matches for
     * @returns {Promise<Array<Suggestion>>}
     */
    function getSuggestionsForContents(contents) {
      var sourceLocale = EditorService.context.srcLocale.localeId;
      var transLocale = EditorService.context.localeId;

      var postQuery = {
        query: {
          method: 'POST',
          params: {
            from: sourceLocale,
            to: transLocale,
            searchType: 'FUZZY_PLURAL'
          },
          isArray: true
        }
      };

      var Suggestions = $resource(UrlService.SUGGESTIONS_URL, {}, postQuery);
      return Suggestions.query({}, contents).$promise;
    }

    return {
      getSuggestionsForPhrase: getSuggestionsForPhrase,
      getSuggestionsForText: getSuggestionsForText
    };
  }
  SuggestionsService.$inject = ["EditorService", "EventService", "UrlService", "$resource"];

  angular
    .module('app')
    .factory('SuggestionsService', SuggestionsService);
})();

(function() {
  'use strict';

  /**
   * TextSuggestionsService.js
   * @ngInject
   */
  function TextSuggestionsService(_, EventService, SuggestionsService,
                                    $rootScope, $timeout) {

    /* Minimum time in milliseconds to wait between requesting results */
    var DELAY = 300;
    var MAX_ACTIVE_REQUESTS = 3;

    /* @type {string} */
    var searchText = null;

    /* @type {Array<Suggestion>} */
    var results = [];

    /**
     * @return {boolean} true if results have been requested and not delivered
     */
    function isLoading() {
      return activeRequests > 0;
    }

    /**
     *
     * @return {string[]} strings that were used to search, or null if no search
     *                    has been performed.
     */
    function getSearchStrings() {
      return searchText ? [searchText] : [];
    }

    /**
     * Get results for the current search
     * @return {Array<Suggestion>} results for the current search. Empty if
     *                             no search has been performed.
     */
    function getResults() {
      return results;
    }


    var pendingSearchHandle = null;

    /* Number of requests that are in progress */
    var activeRequests = 0;
    /* Time that most recent search was started */
    var latestSearchTimestamp = Date.now();
    var latestResultsTimestamp = Date.now();

    /* Search text for a pending search. Will be overwritten whenever a new
     * search is queued */
    var pendingSearch = null;

    /**
     * Make this the next search that will occur when a search is eligible, and
     * ensure that an appropriate timer is running to initiate the pending
     * search.
     *
     * @param {string} searchText
     */
    function deferSearch(searchText) {
      pendingSearch = searchText;
      if (pendingSearchHandle) {
        // timer is already running, no need to start
        return;
      }

      // no timer yet, start one
      waitToRunPendingSearch();
    }

    function waitToRunPendingSearch() {
      var eligibleSearchTime = latestSearchTimestamp + DELAY;
      var timeUntilCanSearch = eligibleSearchTime - Date.now();

      var delay = timeUntilCanSearch > 0 ? timeUntilCanSearch : DELAY;

      pendingSearchHandle = $timeout(function () {
        pendingSearchHandle = null;

        if (activeRequests >= MAX_ACTIVE_REQUESTS) {
          // too many requests, keep waiting
          waitToRunPendingSearch();
          return;
        }

        // run the actual search
        runPendingSearch();
      }, delay);
    }

    /**
     * Initiate the pending search, and set appropriate variables.
     */
    function runPendingSearch() {
      if (pendingSearch === null) {
        // no pending search, skip
        return;
      }

      var search = pendingSearch;
      pendingSearch = null;
      $timeout.cancel(pendingSearchHandle);
      pendingSearchHandle = null;

      searchByText(search);
    }

    /**
     * Perform a search, and set appropriate variables.
     *
     * @param {string} text
     */
    function searchByText(text) {
      searchText = text;
      var timestamp = Date.now();
      latestSearchTimestamp = timestamp;
      activeRequests++;

      // Run the search and notify listeners when it is done
      SuggestionsService.getSuggestionsForText(text).then(
        function (suggestions) {
          // Only update results if this search is more recent than the
          // current results.
          if (timestamp > latestResultsTimestamp) {
            latestResultsTimestamp = timestamp;
            results = suggestions;
          }
        },
        function (error) {
          console.error('Error searching for text ', error);
        }).finally(function () {
          activeRequests--;
          $rootScope.$broadcast('TextSuggestionsService:updated');
          if (activeRequests < MAX_ACTIVE_REQUESTS) {
            runPendingSearch();
          }
        });
    }


    $rootScope.$on(EventService.EVENT.REQUEST_TEXT_SUGGESTIONS,
      function (event, data) {

        if (pendingSearch && pendingSearch === data) {
          // search already pending
          return;
        }

        if (!pendingSearch && activeRequests === 0 && searchText === data) {
          // search is identical and there are no other searches to replace it
          return;
        }

        // Empty search can update immediately
        if (data === '') {
          searchText = data;
          //loading = false;
          results = [];

          // Ensure that earlier active searches will not overwrite results.
          pendingSearch = null;
          $timeout.cancel(pendingSearchHandle);
          latestSearchTimestamp = Date.now;
          latestResultsTimestamp = Date.now();

          $rootScope.$broadcast('TextSuggestionsService:updated');
          return;
        }

        if (activeRequests >= MAX_ACTIVE_REQUESTS) {
          // too many requests, queue this one instead
          deferSearch(data);
          return;
        }

        var eligibleSearchTime = latestSearchTimestamp + DELAY;

        if (Date.now() < eligibleSearchTime) {
          // Too early to search, defer the search
          deferSearch(data);
          return;
        }

        results = [];
        $rootScope.$broadcast('TextSuggestionsService:updated');
        searchByText(data);
      });

    return {
      isLoading: isLoading,
      getSearchStrings: getSearchStrings,
      getResults: getResults
    };
  }
  TextSuggestionsService.$inject = ["_", "EventService", "SuggestionsService", "$rootScope", "$timeout"];

  angular
    .module('app')
    .factory('TextSuggestionsService', TextSuggestionsService);
})();

(function() {
  'use strict';

  /**
   * @name suggestion
   * @description suggestion container
   * @ngInject
   */
  function suggestion() {
    return {
      // Only use the template on elements with this name (not on things that
      // have an attribute or class called 'suggestion'.
      restrict: 'E',
      //required: ['suggestion'],

      // Specify an isolated scope for the suggestion component.
      scope: {
        // make variable 'suggestion' available in the template's scope, and
        // bind its value from the attribute with the same name.
        // (a different name for the attribute can be specified after the =
        suggestion: '=',
        index: '=',
        search: '=',
        diffEnabled: '='

        // If I put & instead of = in front of a name, it will run it in the
        // parent scope instead of this directive's isolated scope. Good for
        // callbacks.
      },
      controller: 'SuggestionCtrl as suggestionCtrl',
      templateUrl: 'components/suggestions/suggestion.html'
    };
  }

  angular
    .module('app')
    .directive('suggestion', suggestion);

})();

(function() {
  'use strict';

  /**
   * @name toggle-checkbox
   * @description Add an extra element to a checkbox to
   * so we can style it differently
   * @ngInject
   */
  function toggleCheckbox() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        element.after('<span class="Toggle-fakeCheckbox"></span>');
      }
    };
  }

  angular
    .module('app')
    .directive('toggleCheckbox', toggleCheckbox);

})();

(function () {
  'use strict';

  /**
   * @typedef {Object} StatusInfo
   * @property {string} ID lower case translation status (content state)
   * @property {string} NAME capitalized representation
   * @property {string} CSSCLASS css class to use for this status
   *
   */
  /**
   * TransStatusService.js
   *
   * @ngInject
   */
  function TransStatusService(_) {
    var transStatusService = this,
        STATUSES = {
          'UNTRANSLATED': {
            'ID': 'untranslated',
            'NAME': 'Untranslated',
            'CSSCLASS': 'neutral'
          },
          'NEEDSWORK': {
            'ID': 'needswork',
            'NAME': 'Needs Work',
            'CSSCLASS': 'unsure'
          },
          'TRANSLATED' : {
            'ID': 'translated',
            'NAME': 'Translated',
            'CSSCLASS': 'success'
          },
          'APPROVED': {
            'ID': 'approved',
            'NAME': 'Approved',
            'CSSCLASS': 'highlight'
          }
        };

    transStatusService.getAll = function() {
      return STATUSES;
    };

    transStatusService.getAllAsArray = function() {
      return _.values(STATUSES);
    };

    /**
     *
     * @param {string} statusKey string representation of the status.
     * @returns {StatusInfo}
     */
    transStatusService.getStatusInfo = function(statusKey) {
      return STATUSES[conformStatus(statusKey)];
    };

    transStatusService.getId = function(statusKey) {
      return STATUSES[conformStatus(statusKey)].ID;
    };

    transStatusService.getServerId = function(statusId) {
      return serverStatusId(statusId);
    };

    transStatusService.getName = function(statusKey) {
      return STATUSES[conformStatus(statusKey)].NAME;
    };

    transStatusService.getCSSClass = function(statusKey) {
      return STATUSES[conformStatus(statusKey)].CSSCLASS;
    };

    /**
     * Conform it to uppercase for lookups and
     * temporary fix for server sending "needReview"
     * instead of needswork status
     * @param  {string} status
     * @return {string}        new value to use
     */
    function conformStatus(statusKey) {
      statusKey = angular.uppercase(statusKey);
      if (!statusKey || statusKey === 'NEW') {
        statusKey = 'UNTRANSLATED';
      } else if (statusKey === 'NEEDREVIEW') {
        statusKey = 'NEEDSWORK';
      }
      return statusKey;
    }

    /**
     * Conform it to PascalCase for lookups and
     * temporary fix for server receiving "needReview"
     * instead of needswork status
     * @param  {string} status
     * @return {string}        new value to use
     */
    function serverStatusId(statusId) {
      statusId = angular.lowercase(statusId);
      if (!statusId || statusId === 'untranslated') {
        return 'New';
      } else if (statusId === 'needswork') {
        return 'NeedReview';
      }
      return statusId.charAt(0).toUpperCase() + statusId.slice(1).toLowerCase();
    }

    return transStatusService;
  }
  TransStatusService.$inject = ["_"];

  angular
    .module('app')
    .factory('TransStatusService', TransStatusService);
})();


(function () {
  'use strict';

  /**
   * TransUnitCtrl.js
   * @ngInject
   */
  function TransUnitCtrl($rootScope, $scope, $element, $stateParams, _,
                         TransUnitService, EventService, LocaleService, focus,
                         EditorShortcuts, PhraseUtil, SettingsService) {

    var transUnitCtrl = this;

    transUnitCtrl.selected = false;
    transUnitCtrl.focused = false;
    transUnitCtrl.focusedTranslationIndex = 0;

    transUnitCtrl.hasTranslationChanged =
      PhraseUtil.hasTranslationChanged;

    transUnitCtrl.focusTranslation = function() {
      if(transUnitCtrl.selected) {
        focus('phrase-' + $scope.phrase.id + '-' +
        transUnitCtrl.focusedTranslationIndex);
      }
    };

    // when user clicked on TU or using tab to nav
    transUnitCtrl.onTextAreaFocus = function(phrase, index) {
      transUnitCtrl.focused = true;
      if (!_.isUndefined(index)) {
        transUnitCtrl.focusedTranslationIndex = index;
      }
      if(!transUnitCtrl.selected) {
        EventService.emitEvent(EventService.EVENT.SELECT_TRANS_UNIT,
          {'id': phrase.id,
            'updateURL': true,
            'focus': true
          }, $scope);
      }
    };

    transUnitCtrl.translationTextModified = function(phrase) {
      EventService.emitEvent(EventService.EVENT.TRANSLATION_TEXT_MODIFIED,
          phrase);
    };

    transUnitCtrl.getPhrase = function() {
      return $scope.phrase;
    };

    transUnitCtrl.init = function() {
      TransUnitService.addController($scope.phrase.id, transUnitCtrl);
      if($stateParams.id && parseInt($stateParams.id) === $scope.phrase.id) {
        EventService.emitEvent(EventService.EVENT.SELECT_TRANS_UNIT,
          {'id': $stateParams.id,
            'updateURL': false,
            'focus' : $stateParams.selected});
      }
    };

    transUnitCtrl.copySource = function($event, phrase, sourceIndex) {
      $event.stopPropagation(); //prevent click event of TU
      EventService.emitEvent(EventService.EVENT.COPY_FROM_SOURCE,
        {'phrase': phrase, 'sourceIndex': sourceIndex}, $scope);
    };

    transUnitCtrl.undoEdit = function($event, phrase) {
      $event.stopPropagation(); //prevent click event of TU
      EventService.emitEvent(EventService.EVENT.UNDO_EDIT,
        phrase, $scope);
    };

    transUnitCtrl.cancelEdit = function($event, phrase) {
      $event.stopPropagation(); //prevent click event of TU
      EventService.emitEvent(EventService.EVENT.CANCEL_EDIT,
        phrase, $scope);
    };

    transUnitCtrl.saveAs = function($event, phrase, status) {
      EditorShortcuts.saveTranslationCallBack($event, phrase, status);
    };

    transUnitCtrl.getLocaleName = function(localeId) {
      return LocaleService.getName(localeId);
    };

    transUnitCtrl.toggleSaveAsOptions = function(open) {
      EventService.broadcastEvent( open ? 'openDropdown': 'closeDropdown',
        {}, $scope);
      if (open) {
        // focus on the first dropdown option
        focus($scope.phrase.id + '-saveAsOption-0');
      }
    };

    var SHOW_SUGGESTIONS = SettingsService.SETTING.SHOW_SUGGESTIONS;
    $scope.showSuggestions = SettingsService.subscribe(SHOW_SUGGESTIONS,
      function (show) {
        $scope.showSuggestions = show;
      });

    $rootScope.$on(EventService.EVENT.SUGGESTIONS_SEARCH_TOGGLE,
      function(event, data) {
        transUnitCtrl.suggestionsSearchIsActive = data;
      });

    transUnitCtrl.toggleSuggestionPanel = function () {
      if (transUnitCtrl.suggestionsSearchIsActive) {
        EventService.emitEvent(EventService.EVENT.SUGGESTIONS_SEARCH_TOGGLE,
          false);
      }
      else {
        SettingsService.update(SHOW_SUGGESTIONS, !$scope.showSuggestions);
      }
    };

    $scope.suggestionCount = 0;
    $rootScope.$on(EventService.EVENT.PHRASE_SUGGESTION_COUNT,
      function (event, data) {
        if (data.id === $scope.phrase.id) {
          $scope.suggestionCount = data.count;
        }
      });

    transUnitCtrl.cancelSaveAsMode = function() {
      EditorShortcuts.cancelSaveAsModeIfOn();
    };

    $scope.$on('$destroy', function () {
      $element.unbind('click', onTransUnitClick);
      $element.unbind('focus', onTransUnitClick);
    });

    transUnitCtrl.updateSaveButton = function (phrase) {
      transUnitCtrl.saveButtonStatus =
        PhraseUtil.getSaveButtonStatus($scope.phrase);
      transUnitCtrl.saveButtonOptions =
        TransUnitService.getSaveButtonOptions(transUnitCtrl.saveButtonStatus,
          $scope.phrase);
      transUnitCtrl.saveButtonText = transUnitCtrl.saveButtonStatus.NAME;
      transUnitCtrl.saveButtonDisabled =
        !PhraseUtil.hasTranslationChanged(phrase);
      transUnitCtrl.loadingClass = '';
      transUnitCtrl.savingStatus = '';
    };

    transUnitCtrl.phraseSaving = function (data) {
      transUnitCtrl.loadingClass = 'is-loading';
      transUnitCtrl.saveButtonStatus =
        transUnitCtrl.savingStatus = data.status;
      transUnitCtrl.saveButtonOptions =
        TransUnitService.getSaveButtonOptions(transUnitCtrl.saveButtonStatus,
          data.phrase);
      transUnitCtrl.saveButtonText = 'Saving…';
      transUnitCtrl.saveButtonDisabled = true;
    };

    transUnitCtrl.saveButtonOptionsAvailable = function() {
      return !_.isEmpty(transUnitCtrl.saveButtonOptions);
    };

    transUnitCtrl.selectTransUnit = function(phrase) {
      if (!transUnitCtrl.selected) {
        EventService.emitEvent(EventService.EVENT.SELECT_TRANS_UNIT,
                               {'id': phrase.id,
                                 'updateURL': true,
                                 'focus': true
                               }, $scope);
      }
    };

    function onTransUnitClick() {
      if(!transUnitCtrl.selected) {
        $scope.$apply(function () {
          EventService.emitEvent(EventService.EVENT.SELECT_TRANS_UNIT,
            {'id': $scope.phrase.id,
              'updateURL': true,
              'focus': true}, $scope);
        });
      }
    }

    return transUnitCtrl;
  }
  TransUnitCtrl.$inject = ["$rootScope", "$scope", "$element", "$stateParams", "_", "TransUnitService", "EventService", "LocaleService", "focus", "EditorShortcuts", "PhraseUtil", "SettingsService"];

  angular
    .module('app')
    .controller('TransUnitCtrl', TransUnitCtrl);
})();


(function () {
  'use strict';

  /**
   * TransUnitService
   *
   * See PhraseService.transformToPhrases function for phrase definition.
   *
   * @ngInject
   */
  function TransUnitService(_, $location, $rootScope, $state, $stateParams,
    $filter, MessageHandler, EventService, TransStatusService, PRODUCTION,
    EditorShortcuts, PhraseUtil, $timeout) {
    var transUnitService = this,
        controllerList = {},
        selectedTUId;

    transUnitService.addController = function(id, controller) {
      controllerList[id] = controller;
    };

    transUnitService.getSaveButtonOptions = function(saveButtonStatus, phrase) {
      return filterSaveButtonOptions(saveButtonStatus, phrase);
    };

    $rootScope.$on(EventService.EVENT.TOGGLE_SAVE_OPTIONS,
      function(event, data) {
        var transUnitCtrl = controllerList[data.id];
        if (transUnitCtrl) {
          transUnitCtrl.toggleSaveAsOptions(data.open);
        }
    });

    /**
     * EventService.EVENT.SELECT_TRANS_UNIT listener
     * - Select and focus a trans-unit.
     * - Perform implicit save on previous selected TU if changed
     * - Update url with TU id without reload state
     */
    $rootScope.$on(EventService.EVENT.SELECT_TRANS_UNIT,
      function (event, data) {
        var newTuController = controllerList[data.id],
            oldTUController = controllerList[selectedTUId],
            updateURL = data.updateURL;

        EventService.emitEvent(EventService.EVENT.REQUEST_PHRASE_SUGGESTIONS,
          {
            'phrase' : newTuController.getPhrase()
          });

        if(newTuController) {
          EditorShortcuts.selectedTUCtrl = newTuController;

          if (selectedTUId && selectedTUId !== data.id) {
            setSelected(oldTUController, false);

            //perform implicit save if changed
            if(PhraseUtil.hasTranslationChanged(
              oldTUController.getPhrase())) {
              EventService.emitEvent(EventService.EVENT.SAVE_TRANSLATION,
                {
                  'phrase' : oldTUController.getPhrase(),
                  'status' : TransStatusService.getStatusInfo('TRANSLATED'),
                  'locale' : $stateParams.localeId,
                  'docId'  : $stateParams.docId
                });
            }
          }

          updateSaveButton(event, newTuController.getPhrase());
          selectedTUId = data.id;
          setSelected(newTuController, true);

          EventService.emitEvent(EventService.EVENT.FOCUS_TRANSLATION, data);

          //Update url without reload state
          if(updateURL) {
            if($state.current.name !== 'editor.selectedContext.tu') {
              $state.go('editor.selectedContext.tu', {
                'id': data.id,
                'selected': data.focus.toString()
              });
            } else {
              $location.search('id', data.id);
              $location.search('selected', data.focus.toString());
            }
          }
        } else {
          MessageHandler.displayWarning('Trans-unit not found:' + data.id);
        }
      });

    /**
     * EventService.EVENT.COPY_FROM_SOURCE listener
     * Copy translation from source
     */
    $rootScope.$on(EventService.EVENT.COPY_FROM_SOURCE,
      function (event, data) {
        var sourceIndex = 0;
        if(data.phrase.plural) {
          //clicked copy source button
          sourceIndex = data.sourceIndex;
          if(_.isUndefined(sourceIndex)) {
            //copy source key shortcut, copy corresponding source to target
            var transUnitCtrl = controllerList[data.phrase.id];
            sourceIndex = transUnitCtrl.focusedTranslationIndex;
            if(data.phrase.sources.length <
              transUnitCtrl.focusedTranslationIndex + 1) {
              sourceIndex = data.phrase.sources.length - 1;
            }
          }
        }
        setTranslationText(data.phrase, data.phrase.sources[sourceIndex]);
      });

    $rootScope.$on(EventService.EVENT.COPY_FROM_SUGGESTION,
      function (event, data) {
        if (selectedTUId) {
          var transUnitCtrl = controllerList[selectedTUId];
          var phrase = transUnitCtrl.getPhrase();

          var suggestion = data.suggestion;
          var targets = suggestion.targetContents;

          var copyAsPlurals = phrase.plural && targets.length > 1;


          if (copyAsPlurals) {
            var pluralCount = phrase.translations.length;

            if (targets.length < pluralCount) {
              var lastSuggestion = _.last(targets);
              // pad suggestions with last suggestion, but only when there are
              // no translations entered for the extra plural forms.
              targets = _.assign(phrase.translations.slice(), targets,
                function (current, suggested) {
                  if (suggested) return suggested;
                  if (current) return current;
                  return lastSuggestion;
                });
            }
            if (targets.length > pluralCount) {
              targets = _.first(targets, pluralCount);
            }

            setAllTranslations(phrase, targets);
          } else {
            setTranslationText(phrase, targets[0]);
          }
        }
      });

    /**
     * EventService.EVENT.UNDO_EDIT listener
     * Cancel edit and restore translation
     */
    $rootScope.$on(EventService.EVENT.UNDO_EDIT,
      function (event, phrase) {
        if (PhraseUtil.hasTranslationChanged(phrase)) {
          setAllTranslations(phrase, phrase.translations);
        }
      });

    /**
     * EventService.EVENT.CANCEL_EDIT listener
     * Cancel edit and restore translation
     */
    $rootScope.$on(EventService.EVENT.CANCEL_EDIT,
      function (event, phrase) {
        if(selectedTUId) {
          setSelected(controllerList[selectedTUId], false);
          selectedTUId = false;
          EditorShortcuts.selectedTUCtrl = null;
        }

        $location.search('selected', null);
        if(!phrase) {
          $location.search('id', null);
        }

        // EditorContentCtrl#changePage doesn't provide a phrase object
        if (phrase) {
          $timeout(function() {
            return $rootScope.$broadcast('blurOn', 'phrase-' + phrase.id);
          });
        }
      });

    /**
     * EventService.EVENT.TRANSLATION_TEXT_MODIFIED listener
     *
     */
    $rootScope.$on(EventService.EVENT.TRANSLATION_TEXT_MODIFIED,
       updateSaveButton);

    /**
     * EventService.EVENT.FOCUS_TRANSLATION listener
     *
     */
    $rootScope.$on(EventService.EVENT.FOCUS_TRANSLATION,
       setFocus);

    /**
      * EventService.EVENT.SAVE_COMPLETED listener
      *
      */
    $rootScope.$on(EventService.EVENT.SAVE_INITIATED,
       phraseSaving);

    /**
      * EventService.EVENT.SAVE_COMPLETED listener
      *
      */
    $rootScope.$on(EventService.EVENT.SAVE_COMPLETED,
       updateSaveButton);

    function setTranslationText(phrase, newText) {
      var index = 0;
      if (phrase.plural) {
        var transUnitCtrl = controllerList[phrase.id];
        index = transUnitCtrl.focusedTranslationIndex;
      }
      phrase.newTranslations[index] = newText;
      EventService.emitEvent(EventService.EVENT.TRANSLATION_TEXT_MODIFIED,
        phrase);
      EventService.emitEvent(EventService.EVENT.FOCUS_TRANSLATION,
        phrase);
    }

    function setAllTranslations(phrase, newTexts) {
      //need slice() for new instance of array
      phrase.newTranslations = newTexts.slice();

      EventService.emitEvent(EventService.EVENT.TRANSLATION_TEXT_MODIFIED,
        phrase);
      EventService.emitEvent(EventService.EVENT.FOCUS_TRANSLATION,
        phrase);
    }

    function updateSaveButton(event, phrase) {
       var transUnitCtrl = controllerList[phrase.id];
       transUnitCtrl.updateSaveButton(phrase);
    }

    function phraseSaving(event, data) {
      var transUnitCtrl = controllerList[data.phrase.id];
      transUnitCtrl.phraseSaving(data);
      EventService.emitEvent(EventService.EVENT.FOCUS_TRANSLATION,
        data.phrase);
    }

    function setSelected(transUnitCtrl, isSelected) {
      //This check is to prevent selected event being triggered repeatedly.
      if(transUnitCtrl.selected !== isSelected) {
        transUnitCtrl.selected = isSelected || false;
      }
    }

    function setFocus(event, phrase) {
      var transUnitCtrl = controllerList[phrase.id];
      transUnitCtrl.focusTranslation();
    }

    /**
     * Filters the dropdown options for saving a translation
     * Unless the translation is empty, remove untranslated as an option
     * Filter the current default save state out of the list and show remaining
     *
     * @param  {Object} saveStatus The current default translation *save* status
     * @return {Array}             Is used to construct the dropdown list
     */
    function filterSaveButtonOptions(saveStatus, phrase) {
      var filteredOptions = [];
      if (saveStatus.ID === 'untranslated') {
        return filteredOptions;
      }
      filteredOptions = $filter('filter')
      (TransStatusService.getAllAsArray(), {ID: '!untranslated'});

      if(phrase.plural) {
        if(PhraseUtil.hasNoTranslation(phrase)) {
          filteredOptions = $filter('filter')
          (filteredOptions, {ID: '!needswork'});
        } else if(PhraseUtil.hasEmptyTranslation(phrase)) {
            filteredOptions = $filter('filter')
            (filteredOptions, {ID: '!translated'});
        }
      }

      if (PRODUCTION) {
        filteredOptions = $filter('filter')
        (filteredOptions, {ID: '!approved'});
      }

      return $filter('filter')(filteredOptions, {ID: '!'+saveStatus.ID});
    }

    return transUnitService;
  }
  TransUnitService.$inject = ["_", "$location", "$rootScope", "$state", "$stateParams", "$filter", "MessageHandler", "EventService", "TransStatusService", "PRODUCTION", "EditorShortcuts", "PhraseUtil", "$timeout"];

  angular
    .module('app')
    .factory('TransUnitService', TransUnitService);
})();



(function() {
  'use strict';

  /**
   * @name trans-unit
   * @description transUnit container
   * @ngInject
   */
  function transUnit() {
    return {
      restrict: 'E',
      required: ['phrase', 'editorContext'],
      scope: {
        phrase: '=',
        firstPhrase: '=',
        editorContext: '='
      },
      controller: 'TransUnitCtrl as transUnitCtrl',
      templateUrl: 'components/transUnit/trans-unit.html',
      link: function(scope, element, attr, TransUnitCtrl) {
        TransUnitCtrl.init();
      }
    };
  }

  angular
    .module('app')
    .directive('transUnit', transUnit);

})();

(function() {
  'use strict';

  /**
   * @name trans-unit
   * @description transUnit container
   * @ngInject
   */
  function transUnitFilter() {
    return {
      restrict: 'E',
      required: ['editor'],
      scope: {
        editor: '='
      },
      templateUrl: 'components/transUnitFilter/trans-unit-filter.html'
    };
  }

  angular
    .module('app')
    .directive('transUnitFilter', transUnitFilter);

})();

(function() {
  'use strict';

  /**
   * UserService.js
   *
   * @ngInject
   */
  function UserService($resource, UrlService) {

    function getUserInfo(username) {
      var UserInfo = $resource(UrlService.USER_INFO_URL, {}, {
        query: {
          method: 'GET',
          params: {
            username: username
          }
        }
      });
      return UserInfo.query().$promise;
    }

    function getMyInfo() {
      var MyInfo = $resource(UrlService.MY_INFO_URL, {}, {
        query: {
          method: 'GET'
        }
      });
      return MyInfo.query().$promise;
    }

    return {
      settings: {
        editor: {
          hideMainNav: false
        }
      },
      getUserInfo: getUserInfo,
      getMyInfo: getMyInfo
    };
  }
  UserService.$inject = ["$resource", "UrlService"];
  angular
    .module('app')
    .factory('UserService', UserService);
})();

(function() {
  'use strict';

  /**
   * FilterUtil.js
   *
   * @ngInject
   */
  function FilterUtil(StringUtil, _) {

    /**
     * Filter in resources on given fields with matched terms
     *
     * @param resources - list of resources
     * @param fields - list of fields to check
     * @param terms - list of term to check
     * @returns {*}
     */
    function filterResources(resources, fields, terms) {
      if(!resources || !fields || !terms) {
        return resources;
      }
      return _.filter(resources, function (resource) {
        return isInclude(resource, fields, terms);
      });
    }

    /**
     * Filter out properties starting with $ (added by promise)
     * @param resources
     */
    function cleanResourceMap(resources) {
      var filteredList = {};
      var ids = Object.keys(resources).filter(function (id) {
        return id.indexOf('$') === -1;
      });
      ids.forEach(function(id) {
        filteredList[id] = (resources[id]);
      });
      return filteredList;
    }

    function cleanResourceList(resources) {
      var filteredList = [];
      var ids = Object.keys(resources).filter(function (id) {
        return id.indexOf('$') === -1;
      });
      ids.forEach(function(id) {
        filteredList.push(resources[id]);
      });
      return filteredList;
    }


    function isInclude(resource, fields, terms) {
      if(!resource || !fields || !terms) {
        return false;
      }
      return _.any(fields, function(field) {
        return _.any(terms, function(term) {
          return StringUtil.equals(resource[field], term, true);
        });
      });
    }

    return {
      filterResources  : filterResources,
      cleanResourceList:cleanResourceList,
      cleanResourceMap   : cleanResourceMap
    };
  }
  FilterUtil.$inject = ["StringUtil", "_"];
  angular
    .module('app')
    .factory('FilterUtil', FilterUtil);
})();

(function() {
  'use strict';

  /**
   * PhraseUtil.js
   *
   * @ngInject
   */
  function PhraseUtil(TransStatusService, _) {

    function getSaveButtonStatus(phrase) {
      if (hasNoTranslation(phrase)) {
        return TransStatusService.getStatusInfo('untranslated');
      }
      else if (hasEmptyTranslation(phrase)) {
        return TransStatusService.getStatusInfo('needswork');
      }
      else if (hasTranslationChanged(phrase)) {
        return TransStatusService.getStatusInfo('translated');
      }
      else {
        return phrase.status;
      }
    }

    function hasTranslationChanged(phrase) {
      // on Firefox with input method turned on,
      // when hitting tab it seems to turn undefined value into ''
      var allSame = _.every(phrase.translations,
        function(translation, index) {
          return nullToEmpty(translation) ===
            nullToEmpty(phrase.newTranslations[index]);
        });
      return !allSame;
    }

    function hasNoTranslation(phrase) {
      return _.isEmpty(_.compact(phrase.newTranslations));
    }

    function hasEmptyTranslation(phrase) {
      return _.compact(phrase.newTranslations).length !==
        phrase.newTranslations.length;
    }

    function nullToEmpty(value) {
      return value || '';
    }

    return {
      getSaveButtonStatus  : getSaveButtonStatus,
      hasTranslationChanged : hasTranslationChanged,
      hasNoTranslation : hasNoTranslation,
      hasEmptyTranslation : hasEmptyTranslation
    };
  }
  PhraseUtil.$inject = ["TransStatusService", "_"];
  angular
    .module('app')
    .factory('PhraseUtil', PhraseUtil);
})();

(function() {
  'use strict';

  /**
   * Utility method for handling $resource.statistic
   *
   * StatisticUtil.js
   * @ngInject
   *
   */

  function StatisticUtil() {
    return {
      getWordStatistic: function(statistics) {
        return statistics[0].unit === 'WORD' ? statistics[0] : statistics[1];
      },
      getMsgStatistic: function(statistics) {
        return statistics[0].unit === 'MESSAGE' ? statistics[0] : statistics[1];
      }
    };
  }
  angular
    .module('app')
    .factory('StatisticUtil', StatisticUtil);
})();

(function() {
  'use strict';

  /**
   * StringUtil
   *
   * @ngInject
   */

  function StringUtil() {
    function startsWith(str, prefix, ignoreCase) {
      if (ignoreCase && str && prefix) {
        str = str.toUpperCase();
        prefix = prefix.toUpperCase();
      }
      return str.lastIndexOf(prefix, 0) === 0;
    }

    function endsWith(str, suffix, ignoreCase) {
      if (ignoreCase && str && suffix) {
        str = str.toUpperCase();
        suffix = suffix.toUpperCase();
      }
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function equals(from, to, ignoreCase) {
      if (ignoreCase && from && to) {
        from = from.toUpperCase();
        to = to.toUpperCase();
      }
      return from === to;
    }

    return {
      startsWith : startsWith,
      endsWith   : endsWith,
      equals     : equals
    };
  }
  angular
    .module('app')
    .factory('StringUtil', StringUtil);
})();

(function() {
  'use strict';

  /**
   * Utility to handles URL related request.
   *
   * UrlService.js
   * @ngInject
   */
  function UrlService($location, $http, $q, $stateParams, _) {
    //IE doesn't support location.origin
    if (!location.origin) {
      location.origin =
        window.location.protocol + '//' + window.location.hostname +
        (window.location.port ? (':' + window.location.port) : '');
    }

    var urlService = this,
      gravatarBaseUrl = 'http://www.gravatar.com/avatar',
      configFile = 'config.json',
      baseUrl = '',
      urls = {},
      uiTranslationsURL = location.origin + location.pathname +
        'translations';

    urlService.serverContextPath = '';

    urlService.init = function () {
      if (baseUrl) {
        return $q.when(baseUrl);
      }
      else {
        /**
         * Temporary solution to handle dynamic context path deployed for
         * Zanata server in JBOSS (/ or /zanata).
         *
         * If config.baseUrl exist and not empty,
         * baseUrl = config.baseUrl
         *
         * ELSE
         * baseUrl = full.url - appPath onwards
         */
        return $http.get(configFile).then(function (response) {
          var config = response.data;
          if (config.baseUrl) {
            baseUrl = config.baseUrl;
          } else {
            var deployPath = config.appPath.replace(/^\//g, ''),
                index = location.href.indexOf(deployPath);

            urlService.serverContextPath = location.origin + location.pathname;
            if(index >= 0) {
              urlService.serverContextPath = location.href.substring(0, index);
            }
            urlService.serverContextPath = urlService.serverContextPath.
              replace(/\/?$/, '/');
            baseUrl = urlService.serverContextPath + 'rest';
          }

          /* jshint -W101 */
          // URLs over multiple lines are hard to read, allowing long lines here.
          // Warnings for jshint are turned off/on with -/+ before the warning code.
          // See: https://github.com/jshint/jshint/blob/2.1.4/src/shared/messages.js
          urls = _.mapValues({
            project: '/project/:projectSlug',
            docs: '/project/:projectSlug/version/:versionSlug/docs',
            locales: '/project/:projectSlug/version/:versionSlug/locales',
            status: '/project/:projectSlug/version/:versionSlug/doc/:docId/status/:localeId',
            textFlows: '/source+trans/:localeId',
            docStats: '/stats/project/:projectSlug/version/:versionSlug/doc/:docId/locale/:localeId',
            myInfo: '/user',
            userInfo: '/user/:username',
            translation: '/trans/:localeId',
            allLocales: '/locales',
            suggestions: '/suggestions'
          }, unary(restUrl));
          /* jshint +W101 */

          urlService.PROJECT_URL = urls.project;
          urlService.LOCALE_LIST_URL = urls.locales;
          urlService.DOCUMENT_LIST_URL = urls.docs;
          urlService.TRANSLATION_STATUS_URL = urls.status;
          urlService.TEXT_FLOWS_URL = urls.textFlows;
          urlService.DOC_STATISTIC_URL = urls.docStats;
          urlService.MY_INFO_URL = urls.myInfo;
          urlService.USER_INFO_URL = urls.userInfo;
          urlService.TRANSLATION_URL = urls.translation;
          urlService.ALL_LOCALE_URL = urls.allLocales;
          urlService.SUGGESTIONS_URL = urls.suggestions;

          urlService.PROJECT_PAGE = function(projectSlug, versionSlug) {
            return urlService.serverContextPath + 'iteration/view/' +
              projectSlug + '/' +  versionSlug;
          };

          urlService.DASHBOARD_PAGE = urlService.serverContextPath +
            'dashboard';
        });
      }
    };

    /**
     * Get the value of a query string parameter.
     */
    urlService.readValue = function (key) {
      return $location.search()[key];
    };

    urlService.gravatarUrl = function (gravatarHash, size) {
      return gravatarBaseUrl + '/' + gravatarHash +
        '?d=mm&amp;r=g&amp;s=' + size;
    };

    urlService.uiTranslationURL = function (locale) {
      return uiTranslationsURL + '/' + locale + '.json';
    };

    urlService.uiTranslationListURL = uiTranslationsURL + '/locales';

    return urlService;

    /**
     * Create a REST URL by appending all the given URL part arguments to the
     * base URL.
     *
     * No separators will be added or removed, so all parts should include
     * leading / and exclude trailing / to avoid problems.
     */
    function restUrl() {
      return baseUrl + Array.prototype.join.call(arguments, '');
    }

    /**
     * Decorate a function to ignore all but the first argument.
     */
    function unary(fun) {
      return function(arg) {
        return fun(arg);
      };
    }
  }
  UrlService.$inject = ["$location", "$http", "$q", "$stateParams", "_"];

  angular
    .module('app')
    .factory('UrlService', UrlService);
})();

//# sourceMappingURL=../maps/app.js.map