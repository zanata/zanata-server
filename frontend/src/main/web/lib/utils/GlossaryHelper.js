import _ from 'lodash';

var GlossaryHelper = {

  /**
   * Generate org.zanata.rest.dto.GlossaryTerm object
   * @param data
   */
  generateGlossaryTermDTO: function (data) {
    //{
    //    "resId": "38dd937c8c7498b5d748f28a09cf1f1c",
    //    "content": "process",
    //    "comments": [],
    //    "locale": "en-US"
    //  },

    var term = {};
    term['resId'] = '';
    term['content'] = '';
    term['locale'] = '';
    term['comments'] = [];

    //_.forOwn(data.comments, function(comment) {
    //  term['comments'].push(comment);
    //});

    return term;
  },

  /**
   * Generate org.zanata.rest.dto.Glossary object
   * @param data
   */
  generateGlossaryDTO: function (data) {
    var glossary = '{}', entry = "{}";
    glossary['glossaryEntries'] = [];

    entry['srcLang'] = '';
    entry['sourceReference'] = '';
    entry['locale'] = '';
    entry['glossaryTerms'] = [];

    //_.forOwn(data.terms, function(term) {
    //  entry['glossaryTerms'].push(this.generateGlossaryTermDTO(term))
    //});

    glossary['glossaryEntries'].push(entry);
    return glossary;
  },

  /**
   *
   * @param localeList - Array org.zanata.rest.dto.GlossaryLocaleStats
   * @param displayName locale display name. e.g English (United States)
   */
  getLocaleIdByDisplayName: function (localeList, displayName) {
    var localeId = _(localeList)
      .filter(function(locale) { return locale.locale.displayName === displayName; })
      .pluck('locale.localeId')
      .value();

    return localeId[0];
  }
};
export default GlossaryHelper;