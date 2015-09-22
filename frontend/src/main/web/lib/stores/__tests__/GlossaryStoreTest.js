jest.dontMock('../GlossaryStore')
  .dontMock('lodash');

describe('GlossaryStoreTest', function() {
  var MockRequest;
  var baseUrl = 'http://localhost/base';
  var user = {"username": "test-user", "email":"zanata@zanata.org", "name": "admin-name", "loggedIn": "true", "imageUrl":"//www.gravatar.com/avatar/dda6e90e3f2a615fb8b31205e8b4894b?d=mm&r=g&s=115", "languageTeams": "English, French, German, Yodish (Yoda English)"}
  var data = {"permission":{"updateGlossary":true, "insertGlossary":true}, "dev": "true", "profileUser" : {"username": "test-user", "email":"zanata@zanata.org", "name":"admin-name","loggedIn":"true","imageUrl":"//www.gravatar.com/avatar/dda6e90e3f2a615fb8b31205e8b4894b?d=mm&r=g&s=115","languageTeams":"English, French, German, Yodish (Yoda English)"}}
  var _ = require('lodash');

  beforeEach(function() {
    require('../../constants/Configs').baseUrl = baseUrl;
    require('../../constants/Configs').user = user;
    require('../../constants/Configs').data = data;
    MockRequest = require('superagent');
  });

  it('will load from server if state.locales is empty', function() {
    var zhHans = {
      "locale": {"localeId": "zh-Hans", "displayName": "Chinese (Simplified)", "alias": ""},
      "numberOfTerms": 0
    };
    var zhHant = {
      "locale": {"localeId": "zh-Hant", "displayName": "Chinese (Traditional)", "alias": ""},
      "numberOfTerms": 0
    };
    var responseBodyLocaleStats = {
      "srcLocale": {
        "locale": {"localeId": "en-US", "displayName": "English (United States)", "alias": ""},
        "numberOfTerms": 474
      },
      "transLocale" : [zhHans, zhHant]
    };
    MockRequest.__setResponse({error: false, body: responseBodyLocaleStats});

    var GlossaryStore = require('../GlossaryStore');

    GlossaryStore.addChangeListener(function() {
      var state = GlossaryStore.init();

      expect(state.canAddNewEntry).toEqual(data.permission.insertGlossary);
      expect(state.canUpdateEntry).toEqual(data.permission.updateGlossary);
      expect(state.srcLocale).toEqual(responseBodyLocaleStats.srcLocale);
      expect(_.size(state.locales)).toEqual(_.size(responseBodyLocaleStats.transLocale));
      expect(state.locales[zhHans.locale.localeId]).toEqual(zhHans);
      expect(state.locales[zhHant.locale.localeId]).toEqual(zhHant);
      expect(_.size(state.localeOptions)).toEqual(_.size(responseBodyLocaleStats.transLocale));
    });

    GlossaryStore.init();
  });
});