import { isUndefined, filter } from 'lodash'
import { trim, isEmptyOrNull } from './StringUtils'
import DateHelpers from './DateHelper'
import defined from 'defined'

var GlossaryHelper = {
  /**
   * Generate org.zanata.rest.dto.GlossaryTerm object
   * returns null if data is undefined or content and locale is empty
   *
   * @param data
   */
  generateGlossaryTermDTO: function (data, trimContent) {
    if (isUndefined(data)) {
      return
    }
    var content = trimContent ? trim(data.content) : data.content
    var locale = data.locale
    var comment = trim(data.comment)

    if (isEmptyOrNull(locale)) {
      return
    } else {
      return {
        content: content,
        locale: locale,
        comment: comment
      }
    }
  },

  /**
   * Generate org.zanata.rest.dto.GlossaryEntry object
   * @param data
   */
  generateGlossaryEntryDTO: function (data) {
    var entry = {}

    entry.id = data.id
    entry.pos = trim(data.pos)
    entry.description = trim(data.description)
    entry.srcLang = data.srcTerm.locale
    entry.sourceReference = data.srcTerm.reference
    entry.glossaryTerms = []

    var srcTerm = this.generateGlossaryTermDTO(data.srcTerm, false)
    if (!isUndefined(srcTerm)) {
      entry.glossaryTerms.push(srcTerm)
    }

    var transTerm = this.generateGlossaryTermDTO(data.transTerm, true)
    if (!isUndefined(transTerm)) {
      entry.glossaryTerms.push(transTerm)
    }
    return entry
  },

  generateEmptyTerm: function (transLocaleId) {
    return {
      content: '',
      locale: transLocaleId,
      comment: '',
      lastModifiedDate: '',
      lastModifiedBy: ''
    }
  },

  generateSrcTerm: function (localeId) {
    var term = this.generateEmptyTerm(localeId)
    term['reference'] = ''
    return term
  },

  getTermByLocale: function (terms, localeId) {
    var term = filter(terms, 'locale', localeId)
    return term.length ? term[0] : null
  },

  generateEntry: function (entry, transLocaleId) {
    var srcTerm =
      this.getTermByLocale(entry.glossaryTerms, entry.srcLang)
    srcTerm.reference = entry.sourceReference
    if (!isEmptyOrNull(srcTerm.lastModifiedDate)) {
      srcTerm.lastModifiedDate =
        DateHelpers.shortDate(DateHelpers.getDate(srcTerm.lastModifiedDate))
    }
    var transTerm =
      this.getTermByLocale(entry.glossaryTerms, transLocaleId)

    if (transTerm) {
      transTerm.lastModifiedDate =
        DateHelpers.shortDate(DateHelpers.getDate(transTerm.lastModifiedDate))
      if (isUndefined(transTerm.comment)) {
        transTerm.comment = ''
      }
    } else {
      transTerm = this.generateEmptyTerm(transLocaleId)
    }

    return {
      id: entry.id,
      pos: defined(entry.pos, ''),
      description: defined(entry.description, ''),
      // remove source term from count
      termsCount: entry.termsCount > 0 ? entry.termsCount - 1 : 0,
      srcTerm: srcTerm,
      transTerm: transTerm,
      status: this.getDefaultEntryStatus()
    }
  },

  getEntryStatus: function (entry, originalEntry) {
    var isSrcModified = (entry.description !== originalEntry.description) ||
      (entry.pos !== originalEntry.pos) ||
      (entry.srcTerm.content !== originalEntry.srcTerm.content)
    var isTransModified =
      entry.transTerm.content !== originalEntry.transTerm.content

    var isSrcValid = this.isSourceValid(entry)
    var canUpdateTransComment = this.canUpdateTransComment(originalEntry)
    return {
      isSrcModified: isSrcModified,
      isTransModified: isTransModified,
      isSrcValid: isSrcValid, // source content is mandatory
      canUpdateTransComment: canUpdateTransComment,
      isSaving: entry.status.isSaving
    }
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
    return !isEmptyOrNull(trim(entry.srcTerm.content))
  },

  canUpdateTransComment: function (entry) {
    return !isEmptyOrNull(entry.transTerm.content)
  }
}

export default GlossaryHelper
