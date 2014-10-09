!function(){"use strict";angular.module("app",["ngResource","ngAnimate","ui.router","templates","cfp.hotkeys","focusOn","monospaced.elastic","gettext"])}(),function(){"use strict";function t(t,e,n){var r=["$q","$rootScope",function(t,e){return{request:function(t){return e.$broadcast("loadingInitiated"),t},requestError:function(e){return console.log("Request error due to ",e),t.reject(e)},response:function(n){return e.$broadcast("loadingComplete"),n||t.when(n)},responseError:function(e){return 401===e.status?console.error("Unauthorized access. Please login"):404===e.status?console.error("Service end point not found- ",e.config.url):console.error("Error in response ",e),t.reject(e)}}}];n.interceptors.push(r),e.otherwise("/"),t.state("editor",{url:"/:projectSlug/:versionSlug/translate",templateUrl:"editor/editor.html",controller:"EditorCtrl as editor",resolve:{url:["UrlService",function(t){return t.init()}]}}).state("editor.selectedContext",{url:"/:docId/:localeId",views:{"editor-content":{templateUrl:"editor/editor-content.html",controller:"EditorContentCtrl as editorContent"},"editor-suggestions":{templateUrl:"editor/editor-suggestions.html",controller:"EditorSuggestionsCtrl as editorSuggestions"},"editor-details":{templateUrl:"editor/editor-details.html",controller:"EditorDetailsCtrl as editorDetails"}}}).state("editor.selectedContext.tu",{url:"/?id&selected?states",reloadOnSearch:!1})}t.$inject=["$stateProvider","$urlRouterProvider","$httpProvider"],angular.module("app").config(t)}(),function(){"use strict";angular.module("app").constant("_",window._).constant("PRODUCTION",!0)}(),function(){"use strict";function t(t,e,n,r,o,i,a,c){function s(){return r.getAllLocales()}function u(){return e.getMyInfo().then(function(t){d.myInfo=t,d.myInfo.locale=r.DEFAULT_LOCALE,d.myInfo.gravatarUrl=n.gravatarUrl(d.myInfo.gravatarHash,72)},function(t){o.displayError("Error loading my info: "+t)})}function l(){r.getUILocaleList().then(function(t){for(var e in t.locales){var n={localeId:t.locales[e],name:""};d.uiLocaleList.push(n)}d.myInfo.locale=r.getLocaleByLocaleId(d.uiLocaleList,r.DEFAULT_LOCALE.localeId),d.myInfo.locale||(d.myInfo.locale=r.DEFAULT_LOCALE)},function(t){o.displayInfo("Error loading UI locale. Default to '"+r.DEFAULT_LOCALE.name+"': "+t),d.myInfo.locale=r.DEFAULT_LOCALE})}var d=this;d.PRODUCTION=c,d.settings=e.settings,d.uiLocaleList=[r.DEFAULT_LOCALE],d.loading=!0,t.$on("$stateChangeStart",function(t,e){d.loading=!0,e.resolve}),t.$on("$stateChangeSuccess",function(t,e){d.loading=!1,e.resolve}),n.init().then(s).then(u).then(l),d.onChangeUILocale=function(t){d.myInfo.locale=t;var e=d.myInfo.locale.localeId;a.startsWith(e,r.DEFAULT_LOCALE.localeId,!0)?i.setCurrentLanguage(r.DEFAULT_LOCALE.localeId):i.loadRemote(n.uiTranslationURL(e)).then(function(){i.setCurrentLanguage(e)},function(t){o.displayInfo("Error loading UI locale. Default to '"+r.DEFAULT_LOCALE.name+"': "+t),i.setCurrentLanguage(r.DEFAULT_LOCALE),d.myInfo.locale=r.DEFAULT_LOCALE})},d.dashboardPage=function(){return n.DASHBOARD_PAGE}}t.$inject=["$scope","UserService","UrlService","LocaleService","MessageHandler","gettextCatalog","StringUtil","PRODUCTION"],angular.module("app").controller("AppCtrl",t)}(),function(){"use strict";function t(t,e,n,r,o,i){function a(t){s(t),o.emitEvent(o.EVENT.CANCEL_EDIT)}function c(){o.emitEvent(o.EVENT.REFRESH_STATISTIC,{projectSlug:e.context.projectSlug,versionSlug:e.context.versionSlug,docId:e.context.docId,localeId:e.context.localeId}),n.getPhraseCount(e.context,p).then(function(t){e.maxPageIndex=parseInt(t/l),t>l&&(e.maxPageIndex=t%l!==0?e.maxPageIndex+=1:e.maxPageIndex),e.maxPageIndex=e.maxPageIndex-1<0?0:e.maxPageIndex-1,s(e.currentPageIndex)})}function s(t){var r=t*l;n.fetchAllPhrase(e.context,p,r,l).then(u)}function u(t){d.phrases=t}var l=50,d=this,f=r.readValue("states"),p={states:f?f.split(" "):f};return d.phrases=[],e.updateContext(i.projectSlug,i.versionSlug,i.docId,i.localeId),c(),t.$on(o.EVENT.GOTO_FIRST_PAGE,function(){e.currentPageIndex>0&&(e.currentPageIndex=0,a(e.currentPageIndex))}),t.$on(o.EVENT.GOTO_PREV_PAGE,function(){e.currentPageIndex>0&&(e.currentPageIndex-=1,a(e.currentPageIndex))}),t.$on(o.EVENT.GOTO_NEXT_PAGE,function(){e.currentPageIndex<e.maxPageIndex&&(e.currentPageIndex+=1,a(e.currentPageIndex))}),t.$on(o.EVENT.GOTO_LAST_PAGE,function(){e.currentPageIndex<e.maxPageIndex&&(e.currentPageIndex=e.maxPageIndex,a(e.currentPageIndex))}),d}t.$inject=["$rootScope","EditorService","PhraseService","UrlService","EventService","$stateParams"],angular.module("app").controller("EditorContentCtrl",t)}(),function(){"use strict";function t(t,e,n,r,o,i,a,c,s,u,l,d,f,p){function g(){E()&&l.go("editor.selectedContext",{docId:v.context.docId,localeId:v.context.localeId})}function E(){return v.context.docId&&v.context.localeId}function S(t,n,r,o){e.getStatistics(t,n,r,o).then(function(t){v.wordStatistic=c.getWordStatistic(t),v.messageStatistic=c.getMsgStatistic(t),v.messageStatistic[a.getId("needswork")]=v.messageStatistic.needReview||0},function(t){d.displayError("Error loading statistic: "+t)})}var v=this;v.pageNumber=1,v.context=i.initContext(u.projectSlug,u.versionSlug,u.docId,n.DEFAULT_LOCALE,n.DEFAULT_LOCALE.localeId,"READ_WRITE"),v.versionPage=function(){return s.PROJECT_PAGE(v.context.projectSlug,v.context.versionSlug)},r.getProjectInfo(u.projectSlug).then(function(t){v.projectInfo=t},function(t){d.displayError("Error getting project information:"+t)}),n.getSupportedLocales(v.context.projectSlug,v.context.versionSlug).then(function(t){if(v.locales=t,!v.locales||v.locales.length<=0)d.displayError("No supported locales in "+v.context.projectSlug+" : "+v.context.versionSlug);else{var e=l.params.localeId,r=v.context;e?(r.localeId=e,n.containsLocale(v.locales,e)||(r.localeId=v.locales[0].localeId)):(r.localeId=v.locales[0].localeId,g())}},function(t){d.displayError("Error getting locale list: "+t)}),e.findAll(v.context.projectSlug,v.context.versionSlug).then(function(t){if(v.documents=t,!v.documents||v.documents.length<=0)d.displayError("No documents in "+v.context.projectSlug+" : "+v.context.versionSlug);else{var n=l.params.docId,r=v.context;n?(r.docId=n,e.containsDoc(v.documents,n)||(r.docId=v.documents[0].name)):(r.docId=v.documents[0].name,g())}},function(t){d.displayError("Error getting document list: "+t)}),f.$on(p.EVENT.SELECT_TRANS_UNIT,function(t,e){v.unitSelected=e.id,v.focused=e.focus}),f.$on(p.EVENT.CANCEL_EDIT,function(){v.unitSelected=!1,v.focused=!1}),f.$on(p.EVENT.REFRESH_STATISTIC,function(t,e){S(e.projectSlug,e.versionSlug,e.docId,e.localeId),v.context.docId=e.docId,v.context.localeId=e.localeId}),v.pageNumber=function(){return 0===i.maxPageIndex?i.currentPageIndex+1:i.currentPageIndex+1+" of "+(i.maxPageIndex+1)},v.getLocaleName=function(t){return n.getName(t)},v.firstPage=function(){p.emitEvent(p.EVENT.GOTO_FIRST_PAGE)},v.lastPage=function(){p.emitEvent(p.EVENT.GOTO_LAST_PAGE)},v.nextPage=function(){p.emitEvent(p.EVENT.GOTO_NEXT_PAGE)},v.previousPage=function(){p.emitEvent(p.EVENT.GOTO_PREV_PAGE)},this.settings=t.settings.editor}t.$inject=["UserService","DocumentService","LocaleService","ProjectService","TransUnitService","EditorService","TransStatusService","StatisticUtil","UrlService","$stateParams","$state","MessageHandler","$rootScope","EventService"],angular.module("app").controller("EditorCtrl",t)}(),function(){"use strict";function t(){var t=this;return t}angular.module("app").controller("EditorDetailsCtrl",t)}(),function(){"use strict";function t(t,e,n,r,o,i,a,c,s,u){function l(t){var u=n.cloneDeep(f.context),l=p[t],d=e(r.TRANSLATION_URL,{},{update:{method:"PUT",params:{localeId:l.locale}}}),g={id:l.phrase.id,revision:l.phrase.revision,content:l.phrase.newTranslation,contents:l.phrase.newTranslations,status:s.getServerId(l.status.ID),plural:l.phrase.plural};d.update(g).$promise.then(function(t){var e=l.phrase.status;i.onTransUnitUpdated(u,g.id,l.locale,t.revision,t.status,l.phrase.newTranslation),a.updateStatistic(l.docId,l.locale,e,t.status,l.phrase.wordCount),o.emitEvent(o.EVENT.SAVE_COMPLETED,l.phrase)},function(t){c.displayWarning("Update translation failed for "+g.id+" -"+t),i.onTransUnitUpdateFailed(g.id),o.emitEvent(o.EVENT.SAVE_COMPLETED,l.phrase)}),delete p[t]}function d(t,e){return""===t.newTranslation?s.getStatusInfo("UNTRANSLATED"):e}var f=this,p={};return f.context={},f.currentPageIndex=0,f.maxPageIndex=0,f.initContext=function(t,e,n,r,o,i){return f.context={projectSlug:t,versionSlug:e,docId:n,srcLocale:r,localeId:o,mode:i},f.context},f.updateContext=function(t,e,n,r){f.context.projectSlug!==t&&(f.context.projectSlug=t),f.context.versionSlug!==e&&(f.context.versionSlug=e),f.context.docId!==n&&(f.context.docId=n),f.context.localeId!==r&&(f.context.localeId=r)},t.$on(o.EVENT.SAVE_TRANSLATION,function(t,e){var r=e.phrase,i=e.status;if(o.emitEvent(o.EVENT.SAVE_INITIATED,e),n.has(p,r.id)){var a=p[r.id];a.phrase=r,a.status=i,l(r.id)}else(u.isTranslationModified(r)||r.status!==i)&&(i=d(r,i),p[r.id]={phrase:r,status:i,locale:e.locale,docId:e.docId},l(r.id))}),f}t.$inject=["$rootScope","$resource","_","UrlService","EventService","PhraseService","DocumentService","MessageHandler","TransStatusService","TransUnitService"],angular.module("app").factory("EditorService",t)}(),function(){"use strict";function t(){var t=this;return t}angular.module("app").controller("EditorSuggestionsCtrl",t)}(),function(){"use strict";function t(t){return{restrict:"A",scope:{callback:"&clickElsewhere"},link:function(e,n){var r=function(t){n[0].contains(t.target)||e.$apply(e.callback(t))};t.on("click",r),e.$on("$destroy",function(){t.off("click",r)})}}}t.$inject=["$document"],angular.module("app").directive("clickElsewhere",t)}(),function(){"use strict";function t(t,e,n,r,o,i,a){function c(t,e){return t+"-"+e}function s(t,e,n,r){var i=o.getWordStatistic(t),a=o.getMsgStatistic(t);if(r=parseInt(r),i){var c=parseInt(i[e])-r;i[e]=0>c?0:c,i[n]=parseInt(i[n])+r}if(a){var s=parseInt(a[e])-1;a[e]=0>s?0:s,a[n]=parseInt(a[n])+1}}var u=this,l={};return u.findAll=function(t,r){var o=e(n.DOCUMENT_LIST_URL,{},{query:{method:"GET",params:{projectSlug:t,versionSlug:r},isArray:!0}});return o.query().$promise},u.getStatistics=function(r,o,i,s){if(i&&s){var d=c(i,s);if(a.has(l,d))return t.when(l[d]);var f=u.encodeDocId(i),p=e(n.DOC_STATISTIC_URL,{},{query:{method:"GET",params:{projectSlug:r,versionSlug:o,docId:f,localeId:s},isArray:!0}});return p.query().$promise.then(function(t){return l[d]=t,l[d]})}},u.encodeDocId=function(t){return t.replace(/\//g,",")},u.containsDoc=function(t,e){return a.any(t,function(t){return r.equals(t.name,e,!0)})},u.updateStatistic=function(t,e,n,r,o){var u=c(t,e);a.has(l,u)&&(s(l[u],n,r,o),i.emitEvent(i.EVENT.REFRESH_STATISTIC,{projectSlug:"tiny-project",versionSlug:"1",docId:t,localeId:e}))},u}t.$inject=["$q","$resource","UrlService","StringUtil","StatisticUtil","EventService","_"],angular.module("app").factory("DocumentService",t)}(),function(){"use strict";function t(t,e,n,r,o,i){var a,c=this,s=t.$new(),u=r.openClass,l=angular.noop,d=e.onToggle?n(e.onToggle):angular.noop;this.init=function(r){c.$element=r,e.isOpen&&(a=n(e.isOpen),l=a.assign,t.$watch(a,function(t){s.isOpen=!!t}))},this.toggle=function(t){return s.isOpen=arguments.length?!!t:!s.isOpen,s.isOpen},this.isOpen=function(){return s.isOpen},s.getToggleElement=function(){return c.toggleElement},s.focusToggleElement=function(){c.toggleElement&&c.toggleElement[0].focus()},s.$watch("isOpen",function(e,n){i[e?"addClass":"removeClass"](c.$element,u),e?(s.focusToggleElement(),o.open(s)):o.close(s),l(t,e),angular.isDefined(e)&&e!==n&&d(t,{open:!!e})}),t.$on("$locationChangeSuccess",function(){s.isOpen=!1}),t.$on("$destroy",function(){s.$destroy()})}t.$inject=["$scope","$attrs","$parse","dropdownConfig","DropdownService","$animate"],angular.module("app").controller("DropdownCtrl",t)}(),function(){"use strict";function t(t){var e=null,n=this;n.open=function(n){e||(t.bind("click",r),t.bind("keydown",o)),e&&e!==n&&(e.isOpen=!1),e=n},n.close=function(n){e===n&&(e=null,t.unbind("click",r),t.unbind("keydown",o))};var r=function(t){var n=e.getToggleElement();t&&n&&n[0].contains(t.target)||e.$apply(function(){e.isOpen=!1})},o=function(t){27===t.which&&(e.focusToggleElement(),r())}}t.$inject=["$document"],angular.module("app").service("DropdownService",t)}(),function(){"use strict";var t={openClass:"is-active"};angular.module("app").constant("dropdownConfig",t)}(),function(){"use strict";function t(){return{restrict:"EA",controller:"DropdownCtrl",link:function(t,e,n,r){r.init(e)}}}function e(){return{restrict:"EA",require:"?^dropdown",link:function(t,e,n,r){if(r){r.toggleElement=e;var o=function(o){o.preventDefault(),e.hasClass("disabled")||n.disabled||t.$apply(function(){r.toggle()})};e.bind("click",o),e.attr({"aria-haspopup":!0,"aria-expanded":!1}),t.$watch(r.isOpen,function(t){e.attr("aria-expanded",!!t)}),t.$on("$destroy",function(){e.unbind("click",o)})}}}}angular.module("app").directive("dropdown",t).directive("dropdownToggle",e)}(),function(){"use strict";function t(t){var e=this;return e.EVENT={LOADING_INITIATED:"loadingInitiated",LOADING_COMPLETE:"loadingStarted",SELECT_TRANS_UNIT:"selectTransUnit",COPY_FROM_SOURCE:"copyFromSource",UNDO_EDIT:"undoEdit",CANCEL_EDIT:"cancelEdit",FOCUS_TRANSLATION:"focusTranslation",SAVE_TRANSLATION:"saveTranslation",SAVE_INITIATED:"saveInitiated",SAVE_COMPLETED:"saveCompleted",TRANSLATION_TEXT_MODIFIED:"translationTextModified",REFRESH_STATISTIC:"refreshStatistic",GOTO_PREV_PAGE:"gotoPreviousPage",GOTO_NEXT_PAGE:"gotoNextPage",GOTO_FIRST_PAGE:"gotoFirstPage",GOTO_LAST_PAGE:"gotoLastPage"},e.broadcastEvent=function(e,n,r){r=r||t,r.$broadcast(e,n)},e.emitEvent=function(e,n,r){r=r||t,r.$emit(e,n)},e}t.$inject=["$rootScope"],angular.module("app").factory("EventService",t)}(),function(){"use strict";function t(t){return{restrict:"E",required:["name"],scope:{name:"@",title:"@",size:"@"},link:function(e,n){var r="",o="";n.addClass("Icon"),e.title&&(o="<title>"+e.title+"</title>"),r='<svg class="Icon-item"><use xlink:href="#Icon-'+e.name+'" />'+o+"</svg>",n.html(t.trustAsHtml(r))}}}t.$inject=["$sce"],angular.module("app").directive("icon",t)}(),function(){"use strict";function t(t,e,n,r,o){function i(e,n){var o=r(t.LOCALE_LIST_URL,{},{query:{method:"GET",params:{projectSlug:e,versionSlug:n},isArray:!0}});return o.query().$promise}function a(){var e=r(t.ALL_LOCALE_URL,{},{query:{method:"GET",isArray:!0}});return e.query().$promise.then(function(t){d=n.cleanResourceList(t)})}function c(){var e=r(t.uiTranslationListURL,{},{query:{method:"GET"}});return e.query().$promise}function s(t,n){return t?o.find(t,function(t){return e.equals(t.localeId,n,!0)}):void 0}function u(t,n){return o.any(t,function(t){return e.equals(t.localeId,n,!0)})}function l(t){var e=s(d,t);return e?e.name:t}var d=[];return{getSupportedLocales:i,getUILocaleList:c,getLocaleByLocaleId:s,getAllLocales:a,containsLocale:u,getName:l,DEFAULT_LOCALE:{localeId:"en-US",name:"English"}}}t.$inject=["UrlService","StringUtil","FilterUtil","$resource","_"],angular.module("app").factory("LocaleService",t)}(),function(){"use strict";function t(){return{restrict:"EA",scope:{loading:"=",inverted:"="},link:function(t){t.classes="",t.$on("loadingInitiated",function(){t.classes+=" is-loading"}),t.$on("loadingComplete",function(){t.classes=t.classes.replace("is-loading","")}),t.$watch("inverted",function(e){e?t.classes+=" LogoLoader--inverted":t.classes=t.classes.replace("LogoLoader--inverted","")})},templateUrl:"components/logo-loader/logo-loader.html"}}angular.module("app").directive("logoLoader",t)}(),function(){"use strict";function t(){return{displayError:function(t){console.error(t)},displayWarning:function(t){console.warn(t)},displayInfo:function(t){console.info(t)}}}angular.module("app").factory("MessageHandler",t)}(),function(){"use strict";function t(){}angular.module("app").factory("NotificationService",t)}(),function(){"use strict";function t(t,e,n,r,o,i){function a(t,e,n,r){return t+"-"+e+"-"+n+"-"+r}var c=this,s={},u={};return c.getStates=function(c,u,l,d){var f=a(c,u,l,d);if(i.has(s,f))return t.when(s[f]);var p=o.encodeDocId(l),g={query:{method:"GET",params:{projectSlug:c,versionSlug:u,docId:p,localeId:d},isArray:!0}},E=e(r.TRANSLATION_STATUS_URL,{},g);return E.query().$promise.then(function(t){return t=n.cleanResourceList(t),s[f]=t,s[f]})},c.getTransUnits=function(o,a){function c(t){t=n.cleanResourceMap(t);for(var e in t)u[e][a]=t[e][a],l[e]=u[e];return l}function s(t){t=n.cleanResourceMap(t);for(var e in t)u[e]=t[e],l[e]=u[e];return l}var l={},d=[],f=[];if(o.forEach(function(t){i.has(u,t)?u[t][a]?l[t]=u[t]:f.push(t):d.push(t)}),i.isEmpty(d)&&i.isEmpty(f))return t.when(l);var p,g;return i.isEmpty(d)||(p=e(r.TEXT_FLOWS_URL,{},{query:{method:"GET",params:{localeId:a,ids:d.join(",")}}})),i.isEmpty(f)||(g=e(r.TRANSLATION_URL,{},{query:{method:"GET",params:{localeId:a,ids:f.join(",")}}})),p&&g?p.query().$promise.then(s).then(g.query().$promise.then(c)):p?p.query().$promise.then(s):g?g.query().$promise.then(c):void 0},c.onTransUnitUpdated=function(t,e,n,r,o,c,l){var d=a(t.projectSlug,t.versionSlug,t.docId,n),f=i.find(s[d],function(t){return t.id===e});f&&(f.state=o);var p=u[e][n];p||(p={}),p.revision=parseInt(r),p.state=o,p.content=c,p.contents=l},c}t.$inject=["$q","$resource","FilterUtil","UrlService","DocumentService","_"],angular.module("app").factory("PhraseCache",t)}(),function(){"use strict";function t(t,e,n,r,o){function i(t,e){return o.find(e,function(e){return e.id===t})}function a(t,n){return n&&(t=e.filterResources(t,["state"],n)),o.map(t,function(t){return t.id})}var c={};return c.phrases=[],c.getPhraseCount=function(t,e){return n.getStates(t.projectSlug,t.versionSlug,t.docId,t.localeId).then(function(t){var n=a(t,e.states);return n.length})},c.fetchAllPhrase=function(t,e,i,s){function u(t){var r=a(t,e.states);return isNaN(i)||(r=isNaN(s)?r.slice(i):r.slice(i,i+s)),n.getTransUnits(r,f).then(l).then(d)}function l(t){return o.map(t,function(t,e){var n=t.source,o=t[f];return{id:parseInt(e),source:n.content,sources:n.contents,translation:o.content?o.content:"",translations:o.contents?o.contents:[],newTranslation:o.content?o.content:"",newTranslations:o.contents?o.contents:[],plural:n.plural,status:r.getStatusInfo(o.state),revision:o.revision?parseInt(o.revision):0,wordCount:parseInt(n.wordCount)}})}function d(e){return n.getStates(t.projectSlug,t.versionSlug,t.docId,f).then(function(t){return c.phrases=o.sortBy(e,function(n){var r=o.findIndex(t,function(t){return t.id===n.id});return r>=0?r:e.length}),c.phrases})}var f=t.localeId;return n.getStates(t.projectSlug,t.versionSlug,t.docId,f).then(u)},c.onTransUnitUpdated=function(t,e,o,a,s,u,l){n.onTransUnitUpdated(t,e,o,a,s,u,l);var d=i(e,c.phrases);d&&(d.translation=u,d.revision=a,d.status=r.getStatusInfo(s))},c.onTransUnitUpdateFailed=function(t){var e=i(t,c.phrases);e&&(e.newTranslation=e.translation)},c}t.$inject=["TransUnitService","FilterUtil","PhraseCache","TransStatusService","_"],angular.module("app").factory("PhraseService",t)}(),function(){"use strict";function t(){return{restrict:"E",required:"progressbarStatistic",scope:{statistic:"=progressbarStatistic",size:"@"},templateUrl:"components/progressbar/progressbar.html",controller:["$scope",function(t){t.$watch("statistic",function(n){n&&(t.style=e(n))},!0)}]}}function e(t){var e=t.total,r=n(t.approved,e),o=n(t.translated,e),i=r,a=n(t.needswork,e),c=r+o,s=n(t.untranslated,e),u=r+o+a,l={};return l.approved={width:r+"%",marginLeft:0},l.translated={width:o+"%",marginLeft:i+"%"},l.needsWork={width:a+"%",marginLeft:c+"%"},l.untranslated={width:s+"%",marginLeft:u+"%"},l}function n(t,e){var n=0;return t&&(n=t/e*100),n}angular.module("app").directive("progressbar",t)}(),function(){"use strict";function t(t,e){function n(n){var r={query:{method:"GET",params:{projectSlug:n}}},o=e(t.PROJECT_URL,{},r);return o.query().$promise}return{getProjectInfo:n}}t.$inject=["UrlService","$resource"],angular.module("app").factory("ProjectService",t)}(),function(){"use strict";function t(){var t=this;t.init=function(){var e=t.container[0],n=t.child[0],r=n.offsetWidth-e.offsetWidth;t.width=r/2}}angular.module("app").controller("ScrollbarWidthCtrl",t)}(),function(){"use strict";function t(){return{restrict:"A",controller:"ScrollbarWidthCtrl as scrollbarWidthCtrl",link:function(t,e,n,r){r.init(e)}}}function e(){return{restrict:"A",require:"?^scrollbarWidth",link:function(t,e,n,r){r&&e.css(n.scrollbarWidthElement,r.width)}}}function n(){return{restrict:"A",require:"?^scrollbarWidth",link:function(t,e,n,r){r&&(r.container=e)}}}function r(){return{restrict:"A",require:"?^scrollbarWidth",link:function(t,e,n,r){r&&(r.child=e)}}}angular.module("app").directive("scrollbarWidth",t).directive("scrollbarWidthElement",e).directive("scrollbarWidthContainer",n).directive("scrollbarWidthChild",r)}(),function(){"use strict";function t(){return{restrict:"A",link:function(t,e){e.after('<span class="Toggle-fakeCheckbox"></span>')}}}angular.module("app").directive("toggleCheckbox",t)}(),function(){"use strict";function t(t){function e(t){return t=angular.uppercase(t),t&&"NEW"!==t?"NEEDREVIEW"===t&&(t="NEEDSWORK"):t="UNTRANSLATED",t}function n(t){return t=angular.lowercase(t),t&&"untranslated"!==t?"needswork"===t?"NeedReview":t.charAt(0).toUpperCase()+t.slice(1).toLowerCase():"New"}var r=this,o={UNTRANSLATED:{ID:"untranslated",NAME:"Untranslated",CSSCLASS:"neutral"},NEEDSWORK:{ID:"needswork",NAME:"Needs Work",CSSCLASS:"unsure"},TRANSLATED:{ID:"translated",NAME:"Translated",CSSCLASS:"success"},APPROVED:{ID:"approved",NAME:"Approved",CSSCLASS:"highlight"}};return r.getAll=function(){return o},r.getAllAsArray=function(){return t.values(o)},r.getStatusInfo=function(t){return o[e(t)]},r.getId=function(t){return o[e(t)].ID},r.getServerId=function(t){return n(t)},r.getName=function(t){return o[e(t)].NAME},r.getCSSClass=function(t){return o[e(t)].CSSCLASS},r}t.$inject=["_"],angular.module("app").factory("TransStatusService",t)}(),function(){"use strict";function t(t,e,n,r,o,i,a,c){function s(){u.selected||t.$apply(function(){i.emitEvent(i.EVENT.SELECT_TRANS_UNIT,{id:t.phrase.id,updateURL:!0,focus:!0},t)})}var u=this;return u.selected=!1,u.isTranslationModified=o.isTranslationModified,u.focusTranslation=function(){c("phrase-"+t.phrase.id)},u.translationTextModified=function(t){i.emitEvent(i.EVENT.TRANSLATION_TEXT_MODIFIED,t)},u.getPhrase=function(){return t.phrase},u.init=function(){o.addController(t.phrase.id,u),n.id&&parseInt(n.id)===t.phrase.id&&i.emitEvent(i.EVENT.SELECT_TRANS_UNIT,{id:n.id,updateURL:!1,focus:n.selected},null)},u.copySource=function(e,n){e.stopPropagation(),i.emitEvent(i.EVENT.COPY_FROM_SOURCE,n,t)},u.undoEdit=function(e,n){e.stopPropagation(),i.emitEvent(i.EVENT.UNDO_EDIT,n,t)},u.cancelEdit=function(e,n){e.stopPropagation(),i.emitEvent(i.EVENT.CANCEL_EDIT,n,t)},u.saveAs=function(e,r,o){i.emitEvent(i.EVENT.SAVE_TRANSLATION,{phrase:r,status:o,locale:n.localeId,docId:n.docId},t)},u.getLocaleName=function(t){return a.getName(t)},e.bind("click",s),t.$on("$destroy",function(){e.unbind("click",s)}),u.updateSaveButton=function(e){u.saveButtonStatus=o.getSaveButtonStatus(t.phrase),u.saveButtonOptions=o.getSaveButtonOptions(u.saveButtonStatus),u.saveButtonText=u.saveButtonStatus.NAME,u.saveButtonDisabled=!o.isTranslationModified(e),u.loadingClass="",u.savingStatus=""},u.phraseSaving=function(t){u.loadingClass="is-loading",u.saveButtonStatus=u.savingStatus=t.status,u.saveButtonOptions=o.getSaveButtonOptions(u.saveButtonStatus),u.saveButtonText="Saving…",u.saveButtonDisabled=!0},u.saveButtonOptionsAvailable=function(){return!r.isEmpty(u.saveButtonOptions)},u}t.$inject=["$scope","$element","$stateParams","_","TransUnitService","EventService","LocaleService","focus"],angular.module("app").controller("TransUnitCtrl",t)}(),function(){"use strict";function t(t,e,n,r,o,i,a,c,s){function u(t,e){t.newTranslation=e,a.emitEvent(a.EVENT.TRANSLATION_TEXT_MODIFIED,t),a.emitEvent(a.EVENT.FOCUS_TRANSLATION,t)}function l(t,e){var n=v[e.id];n.updateSaveButton(e)}function d(t,e){var n=v[e.phrase.id];n.phraseSaving(e),a.emitEvent(a.EVENT.FOCUS_TRANSLATION,e.phrase)}function f(t,e){t.selected=e||!1}function p(t,e){var n=v[e.id];n.focusTranslation()}function g(t){var e=[];return"untranslated"===t.ID?[]:(e=o("filter")(c.getAllAsArray(),{ID:"!untranslated"}),s&&(e=o("filter")(e,{ID:"!approved"})),o("filter")(e,{ID:"!"+t.ID}))}var E,S=this,v={};return S.addController=function(t,e){v[t]=e},S.isTranslationModified=function(t){return t.newTranslation!==t.translation},S.getSaveButtonStatus=function(t){return""===t.newTranslation?c.getStatusInfo("untranslated"):t.translation!==t.newTranslation?c.getStatusInfo("translated"):t.status},S.getSaveButtonOptions=function(t){return g(t)},e.$on(a.EVENT.SELECT_TRANS_UNIT,function(e,o){var s=v[o.id],u=v[E],d=o.updateURL;s?(E&&E!==o.id&&(S.isTranslationModified(u.getPhrase())&&a.emitEvent(a.EVENT.SAVE_TRANSLATION,{phrase:u.getPhrase(),status:c.getStatusInfo("TRANSLATED"),locale:r.localeId,docId:r.docId}),f(u,!1)),l(e,s.getPhrase()),E=o.id,f(s,!0),a.emitEvent(a.EVENT.FOCUS_TRANSLATION,o),d&&("editor.selectedContext.tu"!==n.current.name?n.go("editor.selectedContext.tu",{id:o.id,selected:o.focus.toString()}):(t.search("id",o.id),t.search("selected",o.focus.toString())))):i.displayWarning("Trans-unit not found:"+o.id)}),e.$on(a.EVENT.COPY_FROM_SOURCE,function(t,e){u(e,e.source)}),e.$on(a.EVENT.UNDO_EDIT,function(t,e){S.isTranslationModified(e)&&u(e,e.translation)}),e.$on(a.EVENT.CANCEL_EDIT,function(e,n){n&&S.isTranslationModified(n)&&(n.newTranslation=n.translation),E&&(f(v[E],!1),E=!1),t.search("selected",null),n||t.search("id",null)}),e.$on(a.EVENT.TRANSLATION_TEXT_MODIFIED,l),e.$on(a.EVENT.FOCUS_TRANSLATION,p),e.$on(a.EVENT.SAVE_INITIATED,d),e.$on(a.EVENT.SAVE_COMPLETED,l),S}t.$inject=["$location","$rootScope","$state","$stateParams","$filter","MessageHandler","EventService","TransStatusService","PRODUCTION"],angular.module("app").factory("TransUnitService",t)}(),function(){"use strict";function t(){return{restrict:"E",required:["phrase","editorContext"],scope:{phrase:"=",firstPhrase:"=",editorContext:"="},controller:"TransUnitCtrl as transUnitCtrl",templateUrl:"components/transUnit/trans-unit.html",link:function(t,e,n,r){r.init()}}}angular.module("app").directive("transUnit",t)}(),function(){"use strict";function t(t,e){function n(n){var r=t(e.USER_INFO_URL,{},{query:{method:"GET",params:{username:n}}});return r.query().$promise}function r(){var n=t(e.MY_INFO_URL,{},{query:{method:"GET"}});return n.query().$promise}return{settings:{editor:{hideMainNav:!1}},getUserInfo:n,getMyInfo:r}}t.$inject=["$resource","UrlService"],angular.module("app").factory("UserService",t)}(),function(){"use strict";function t(t,e){function n(t,n,r){return t&&n&&r?e.filter(t,function(t){return i(t,n,r)}):t}function r(t){var e={},n=Object.keys(t).filter(function(t){return-1===t.indexOf("$")});return n.forEach(function(n){e[n]=t[n]}),e}function o(t){var e=[],n=Object.keys(t).filter(function(t){return-1===t.indexOf("$")});return n.forEach(function(n){e.push(t[n])}),e}function i(n,r,o){return n&&r&&o?e.any(r,function(r){return e.any(o,function(e){return t.equals(n[r],e,!0)})}):!1}return{filterResources:n,cleanResourceList:o,cleanResourceMap:r}}t.$inject=["StringUtil","_"],angular.module("app").factory("FilterUtil",t)}(),function(){"use strict";function t(){return{getWordStatistic:function(t){return"WORD"===t[0].unit?t[0]:t[1]},getMsgStatistic:function(t){return"MESSAGE"===t[0].unit?t[0]:t[1]}}}angular.module("app").factory("StatisticUtil",t)}(),function(){"use strict";function t(){function t(t,e,n){return n&&t&&e&&(t=t.toUpperCase(),e=e.toUpperCase()),0===t.lastIndexOf(e,0)}function e(t,e,n){return n&&t&&e&&(t=t.toUpperCase(),e=e.toUpperCase()),-1!==t.indexOf(e,t.length-e.length)}function n(t,e,n){return n&&t&&e&&(t=t.toUpperCase(),e=e.toUpperCase()),t===e}return{startsWith:t,endsWith:e,equals:n}}angular.module("app").factory("StringUtil",t)}(),function(){"use strict";function t(t,e,n,r,o){function i(){return l+Array.prototype.join.call(arguments,"")}function a(t){return function(e){return t(e)}}location.origin||(location.origin=window.location.protocol+"//"+window.location.hostname+(window.location.port?":"+window.location.port:""));var c=this,s="http://www.gravatar.com/avatar",u="config.json",l="",d={},f=location.origin+location.pathname+"translations";return c.serverContextPath="",c.init=function(){return l?n.when(l):e.get(u).then(function(t){var e=t.data;if(e.baseUrl)l=e.baseUrl;else{var n=e.appPath.replace(/^\//g,""),r=location.href.indexOf(n);c.serverContextPath=location.origin+location.pathname,r>=0&&(c.serverContextPath=location.href.substring(0,r)),c.serverContextPath=c.serverContextPath.replace(/\/?$/,"/"),l=c.serverContextPath+"rest"}d=o.mapValues({project:"/project/:projectSlug",docs:"/project/:projectSlug/version/:versionSlug/docs",locales:"/project/:projectSlug/version/:versionSlug/locales",status:"/project/:projectSlug/version/:versionSlug/doc/:docId/status/:localeId",textFlows:"/source+trans/:localeId",docStats:"/stats/project/:projectSlug/version/:versionSlug/doc/:docId/locale/:localeId",myInfo:"/user",userInfo:"/user/:username",translation:"/trans/:localeId",allLocales:"/locales"},a(i)),c.PROJECT_URL=d.project,c.LOCALE_LIST_URL=d.locales,c.DOCUMENT_LIST_URL=d.docs,c.TRANSLATION_STATUS_URL=d.status,c.TEXT_FLOWS_URL=d.textFlows,c.DOC_STATISTIC_URL=d.docStats,c.MY_INFO_URL=d.myInfo,c.USER_INFO_URL=d.userInfo,c.TRANSLATION_URL=d.translation,c.ALL_LOCALE_URL=d.allLocales,c.PROJECT_PAGE=function(t,e){return c.serverContextPath+"iteration/view/"+t+"/"+e},c.DASHBOARD_PAGE=c.serverContextPath+"dashboard"})},c.readValue=function(e){return t.search()[e]},c.gravatarUrl=function(t,e){return s+"/"+t+"?d=mm&amp;r=g&amp;s="+e},c.uiTranslationURL=function(t){return f+"/"+t+".json"},c.uiTranslationListURL=f+"/locales",c}t.$inject=["$location","$http","$q","$stateParams","_"],angular.module("app").factory("UrlService",t)}();
//# sourceMappingURL=../maps/app.js.map