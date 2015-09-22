import _ from 'lodash';
import StringUtils from './StringUtils'

var GlossaryHelper = {
  NEW_ENTRY_KEY : 'NEW_ENTRY',

  /**
   * Generate org.zanata.rest.dto.GlossaryTerm object
   * @param data
   */
  generateGlossaryTermDTO: function (data) {
    var content = StringUtils.trim(data.content),
      locale = data.locale,
      comments = StringUtils.trim(data.comment);

    if(StringUtils.isEmptyOrNull(content) &&
        StringUtils.isEmptyOrNull(locale)) {
      return null;
    } else {
      var term = {};
      term['content'] = content;
      term['locale'] = locale;
      term['comments'] = comments;
      return term;
    }
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
    if(!_.isNull(srcTerm)) {
      entry['glossaryTerms'].push(srcTerm);
    }

    var transTerm = this.generateGlossaryTermDTO(data.transTerm);
    if(!_.isNull(transTerm)) {
      entry['glossaryTerms'].push(transTerm);
    }

    glossary['glossaryEntries'].push(entry);
    return glossary;
  },

  generateTerm: function(transLocaleId){
    return {
      content: '',
      locale: transLocaleId,
      comment: '',
      lastModifiedDate: '',
      lastModifiedBy: ''
    }
  },

  generateSrcTerm: function (localeId) {
    var term = this.generateTerm(localeId);
    term['reference'] = '';
    return term;
  },

  getTermByLocale: function (terms, localeId) {
    var term =  _(terms)
      .filter(function(term) { return term.locale === localeId; })
      .value();
    return _.size(term) <= 0 ? null : term[0];
  },

  getEntryStatus: function (entry, originalEntry) {
    var isSrcModified = (entry.description !== originalEntry.description) ||
      (entry.pos !== originalEntry.pos) || (entry.srcTerm.content !== originalEntry.srcTerm.content);
    var isTransModified = entry.transTerm.content !== originalEntry.transTerm.content;

    var isSrcValid = this.isSourceValid(entry);
    var canUpdateTransComment = this.canUpdateTransComment(originalEntry);
    return {
      isSrcModified: isSrcModified,
      isTransModified: isTransModified,
      isSrcValid: isSrcValid, //source content is mandatory
      canUpdateTransComment: canUpdateTransComment
    };
  },

  getDefaultEntryStatus: function () {
    return {
      isSrcModified: false,
      isTransModified: false,
      isSrcValid: false,
      canUpdateTransComment: false
    }
  },

  isSourceValid: function (entry) {
    return !StringUtils.isEmptyOrNull(StringUtils.trim(entry.srcTerm.content));
  },

  canUpdateTransComment: function (entry) {
    return !StringUtils.isEmptyOrNull(entry.transTerm.content);
  },

};
export default GlossaryHelper;
