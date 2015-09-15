import _ from 'lodash';
import StringUtils from './StringUtils'

var GlossaryHelper = {

  /**
   * Generate org.zanata.rest.dto.GlossaryTerm object
   * @param data
   */
  generateGlossaryTermDTO: function (data) {
    var term = {};
    term['content'] = StringUtils.trim(data.content);
    term['locale'] = data.locale;
    term['comments'] = StringUtils.trim(data.comment);
    return term;
  },

  /**
   * Generate org.zanata.rest.dto.Glossary object
   * @param data
   */
  generateGlossaryDTO: function (data) {
    var glossary = {}, entry = {};
    glossary['glossaryEntries'] = [];

    entry['resId'] = data.resId;
    entry['pos'] = StringUtils.trim(data.pos);
    entry['description'] = StringUtils.trim(data.description);
    entry['srcLang'] = data.srcTerm.locale;
    entry['sourceReference'] = data.srcTerm.reference;
    entry['glossaryTerms'] = [];

    var srcTerm = this.generateGlossaryTermDTO(data.srcTerm);
    entry['glossaryTerms'].push(srcTerm);

    var transTerm = this.generateGlossaryTermDTO(data.transTerm);
    entry['glossaryTerms'].push(transTerm);

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
  },

  getTermByLocale: function (terms, localeId) {
    var term =  _(terms)
      .filter(function(term) { return term.locale === localeId; })
      .value();
    return term[0];
  },

  compare: function (entry1, entry2) {
    var isSrcModified = (entry1.description !== entry2.description) ||
      (entry1.pos !== entry2.pos) || (entry1.srcTerm.content !== entry2.srcTerm.content);
    var isTransModified = entry1.transTerm.content !== entry2.transTerm.content;

    return {
      source: isSrcModified,
      trans: isTransModified
    };
  }

};
export default GlossaryHelper;
