import _ from 'lodash';
import StringUtils from './StringUtils'

var GlossaryHelper = {
  /**
   * Generate org.zanata.rest.dto.GlossaryTerm object
   * returns null if data is undefined or content and locale is empty
   *
   * @param data
   */
  generateGlossaryTermDTO: function (data, trimContent) {
    if(_.isUndefined(data)) {
      return null;
    }
    var content = trimContent ? StringUtils.trim(data.content) : data.content,
      locale = data.locale,
      comments = StringUtils.trim(data.comment);

    if(StringUtils.isEmptyOrNull(content) && StringUtils.isEmptyOrNull(locale)) {
      return null;
    } else {
      return  {
        content: content,
        locale: locale,
        comments: comments
      };
    }
  },

  /**
   * Generate org.zanata.rest.dto.Glossary object
   * @param data
   */
  generateGlossaryDTO: function (data) {
    var glossary = {}, entry = {};
    glossary['glossaryEntries'] = [];

    entry['contentHash'] = data.contentHash;
    entry['pos'] = StringUtils.trim(data.pos);
    entry['description'] = StringUtils.trim(data.description);
    entry['srcLang'] = data.srcTerm.locale;
    entry['sourceReference'] = data.srcTerm.reference;
    entry['glossaryTerms'] = [];

    var srcTerm = this.generateGlossaryTermDTO(data.srcTerm, false);
    if(!_.isNull(srcTerm) && !_.isUndefined(srcTerm)) {
      entry['glossaryTerms'].push(srcTerm);
    }

    var transTerm = this.generateGlossaryTermDTO(data.transTerm, true);
    if(!_.isNull(transTerm) && !_.isUndefined(transTerm)) {
      entry['glossaryTerms'].push(transTerm);
    }

    glossary['glossaryEntries'].push(entry);
    return glossary;
  },

  generateEmptyTerm: function(transLocaleId){
    return {
      content: '',
      locale: transLocaleId,
      comment: '',
      lastModifiedDate: '',
      lastModifiedBy: ''
    }
  },

  generateSrcTerm: function (localeId) {
    var term = this.generateEmptyTerm(localeId);
    term['reference'] = '';
    return term;
  },

  getTermByLocale: function (terms, localeId) {
    var term = _.filter(terms, 'locale', localeId);
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
      canUpdateTransComment: canUpdateTransComment,
      isSaving: entry.status.isSaving
    };
  },

  getDefaultEntryStatus: function () {
    return {
      isSrcModified: false,
      isTransModified: false,
      isSrcValid: true,
      canUpdateTransComment: true,
      isSaving: false
    }
  },

  isSourceValid: function (entry) {
    return !StringUtils.isEmptyOrNull(StringUtils.trim(entry.srcTerm.content));
  },

  canUpdateTransComment: function (entry) {
    return !StringUtils.isEmptyOrNull(entry.transTerm.content);
  }
};
export default GlossaryHelper;
