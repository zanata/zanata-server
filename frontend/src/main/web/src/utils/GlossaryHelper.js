import { isUndefined, filter, cloneDeep } from 'lodash'
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
    if (isUndefined(data) || isEmptyOrNull(data.locale)) {
      return
    }
    return {
      content: trimContent ? trim(data.content) : data.content,
      locale: data.locale,
      comment: trim(data.comment)
    }
  },

  convertToDTO: function (term) {
    let newTerm = cloneDeep(term)
    newTerm.pos = trim(newTerm.pos)
    newTerm.description = trim(newTerm.description)
    delete newTerm.status
    return JSON.stringify([newTerm])
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

  toEmptyStringIfUndefined: function (val) {
    return isEmptyOrNull(val) ? '' : val
  },

  getEntryStatus: function (entry, originalEntry) {
    const source = this.toEmptyStringIfUndefined(entry.glossaryTerms[0].content)
    const trans = this.toEmptyStringIfUndefined(entry.glossaryTerms[1].content)
    const desc = this.toEmptyStringIfUndefined(entry.description)
    const pos = this.toEmptyStringIfUndefined(entry.pos)
    const ori_source = this.toEmptyStringIfUndefined(
      originalEntry.glossaryTerms[0].content)
    const ori_trans = this.toEmptyStringIfUndefined(
      originalEntry.glossaryTerms[1].content)
    const ori_desc = this.toEmptyStringIfUndefined(originalEntry.description)
    const ori_pos = this.toEmptyStringIfUndefined(originalEntry.pos)

    let isSrcModified = (desc !== ori_desc) ||
      (pos !== ori_pos) ||
      (source !== ori_source)
    let isTransModified = trans !== ori_trans

    let isSrcValid = !isEmptyOrNull(trim(source))
    let canUpdateTransComment = !isEmptyOrNull(ori_trans)

    return {
      isSrcModified: isSrcModified,
      isTransModified: isTransModified,
      isSrcValid: isSrcValid, // source content is mandatory
      canUpdateTransComment: canUpdateTransComment,
      isSaving: entry.status ? entry.status.isSaving : false
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

  canUpdateTransComment: function (entry) {
    return !isEmptyOrNull(entry.transTerm.content)
  }
}

export default GlossaryHelper
