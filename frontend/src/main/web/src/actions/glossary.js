import { createAction } from 'redux-actions'
import { CALL_API } from 'redux-api-middleware'
import { isEmpty, forOwn, cloneDeep } from 'lodash'
import { arrayOf, normalize } from 'normalizr'
import { glossaryTerm } from '../schemas'
import { replaceRouteQuery } from '../utils/RoutingHelpers'
import Configs from '../constants/Configs'
import GlossaryHelper from '../utils/GlossaryHelper'

export const SEVERITY = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
}

export const GLOSSARY_PAGE_SIZE = 1000

export const GLOSSARY_UPDATE_INDEX = 'GLOSSARY_UPDATE_INDEX'
export const GLOSSARY_UPDATE_FILTER = 'GLOSSARY_UPDATE_FILTER'
export const GLOSSARY_UPDATE_LOCALE = 'GLOSSARY_UPDATE_LOCALE'
export const GLOSSARY_INIT_STATE_FROM_URL = 'GLOSSARY_INIT_STATE_FROM_URL'
export const GLOSSARY_INVALIDATE_RESULTS = 'GLOSSARY_INVALIDATE_RESULTS'
export const GLOSSARY_TERMS_INVALIDATE = 'GLOSSARY_TERMS_INVALIDATE'
export const GLOSSARY_TERMS_REQUEST = 'GLOSSARY_TERMS_REQUEST'
export const GLOSSARY_TERMS_SUCCESS = 'GLOSSARY_TERMS_SUCCESS'
export const GLOSSARY_TERMS_FAILURE = 'GLOSSARY_TERMS_FAILURE'
export const GLOSSARY_DELETE_REQUEST = 'GLOSSARY_DELETE_REQUEST'
export const GLOSSARY_DELETE_SUCCESS = 'GLOSSARY_DELETE_SUCCESS'
export const GLOSSARY_DELETE_FAILURE = 'GLOSSARY_DELETE_FAILURE'
export const GLOSSARY_INVALIDATE_STATS = 'GLOSSARY_INVALIDATE_STATS'
export const GLOSSARY_STATS_REQUEST = 'GLOSSARY_STATS_REQUEST'
export const GLOSSARY_STATS_SUCCESS = 'GLOSSARY_STATS_SUCCESS'
export const GLOSSARY_STATS_FAILURE = 'GLOSSARY_STATS_FAILURE'
export const GLOSSARY_SELECT_TERM = 'GLOSSARY_SELECT_TERM'
export const GLOSSARY_UPDATE_FIELD = 'GLOSSARY_UPDATE_FIELD'
export const GLOSSARY_RESET_TERM = 'GLOSSARY_RESET_TERM'
export const GLOSSARY_UPDATE_REQUEST = 'GLOSSARY_UPDATE_REQUEST'
export const GLOSSARY_UPDATE_SUCCESS = 'GLOSSARY_UPDATE_SUCCESS'
export const GLOSSARY_UPDATE_FAILURE = 'GLOSSARY_UPDATE_FAILURE'
export const GLOSSARY_UPLOAD_REQUEST = 'GLOSSARY_UPLOAD_REQUEST'
export const GLOSSARY_UPLOAD_SUCCESS = 'GLOSSARY_UPLOAD_SUCCESS'
export const GLOSSARY_UPLOAD_FAILURE = 'GLOSSARY_UPLOAD_FAILURE'
export const GLOSSARY_UPDATE_IMPORT_FILE = 'GLOSSARY_UPDATE_IMPORT_FILE'
export const GLOSSARY_UPDATE_IMPORT_FILE_LOCALE = 'GLOSSARY_UPDATE_IMPORT_FILE_LOCALE'
export const GLOSSARY_TOGGLE_IMPORT_DISPLAY = 'GLOSSARY_TOGGLE_IMPORT_DISPLAY'
export const GLOSSARY_UPDATE_COL_SORT = 'GLOSSARY_UPDATE_COL_SORT'
export const GLOSSARY_TOGGLE_NEW_ENTRY_DISPLAY = 'GLOSSARY_TOGGLE_NEW_ENTRY_DISPLAY'
export const GLOSSARY_CREATE_REQUEST = 'GLOSSARY_CREATE_REQUEST'
export const GLOSSARY_CREATE_SUCCESS = 'GLOSSARY_CREATE_SUCCESS'
export const GLOSSARY_CREATE_FAILURE = 'GLOSSARY_CREATE_FAILURE'

// TODO: Add the following
export const GLOSSARY_SAVE = 'GLOSSARY_SAVE'
export const GLOSSARY_UPDATE = 'GLOSSARY_UPDATE'
export const GLOSSARY_UPDATE_SORT = 'GLOSSARY_UPDATE_SORT'
export const GLOSSARY_UPDATE_COMMENT = 'GLOSSARY_UPDATE_COMMENT'
export const GLOSSARY_UPDATE_FOCUSED_ROW = 'GLOSSARY_UPDATE_FOCUSED_ROW'
export const GLOSSARY_CLEAR_MESSAGE = 'GLOSSARY_CLEAR_MESSAGE'

export const glossaryUpdateIndex = createAction(GLOSSARY_UPDATE_INDEX)
export const glossaryUpdateLocale = createAction(GLOSSARY_UPDATE_LOCALE)
export const glossaryUpdateFilter = createAction(GLOSSARY_UPDATE_FILTER)
export const glossaryUpdateField = createAction(GLOSSARY_UPDATE_FIELD)
export const glossaryResetTerm = createAction(GLOSSARY_RESET_TERM)
export const updateSelectedTerm = createAction(GLOSSARY_SELECT_TERM)
export const glossaryUpdateImportFile =
  createAction(GLOSSARY_UPDATE_IMPORT_FILE)
export const glossaryToggleImportFileDisplay =
  createAction(GLOSSARY_TOGGLE_IMPORT_DISPLAY)
export const glossaryUpdateImportFileLocale =
  createAction(GLOSSARY_UPDATE_IMPORT_FILE_LOCALE)
export const glossaryUpdateColSort = createAction(GLOSSARY_UPDATE_COL_SORT)
export const glossaryToggleNewEntryModal = createAction(GLOSSARY_TOGGLE_NEW_ENTRY_DISPLAY)

const getPageNumber =
  (index) => Math.floor(index / GLOSSARY_PAGE_SIZE) + 1

export const glossaryInvalidateResults =
  createAction(GLOSSARY_INVALIDATE_RESULTS)

export const importGlossaryFile = (dispatch, data, srcLocaleId) => {
  const endpoint = Configs.API_ROOT + 'glossary'
  let formData = new FormData()
  formData.append('file', data.file, data.file.name)
  formData.append('fileName', data.file.name)
  formData.append('srcLocale', srcLocaleId)
  formData.append('transLocale', data.transLocale.value)

  let headers = {
    'Accept': 'application/json'
  }
  if (Configs.auth) {
    headers['x-auth-token'] = Configs.auth.token
    headers['x-auth-user'] = Configs.auth.user
  }

  return {
    [CALL_API]: {
      endpoint,
      method: 'POST',
      headers: headers,
      body: formData,
      types: [
        GLOSSARY_UPLOAD_REQUEST,
        {
          type: GLOSSARY_UPLOAD_SUCCESS,
          payload: (action, state, res) => {
            return res.json().then((json) => {
              dispatch(getGlossaryStats(dispatch))
              return json
            })
          }
        },
        GLOSSARY_UPLOAD_FAILURE
      ]
    }
  }
}

export const createGlossaryTerm = (dispatch, term) => {
  let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  if (Configs.auth) {
    headers['x-auth-token'] = Configs.auth.token
    headers['x-auth-user'] = Configs.auth.user
  }
  const endpoint = Configs.API_ROOT + 'glossary/entries'
  const entryDTO = GlossaryHelper.convertToDTO(term)
  return {
    [CALL_API]: {
      endpoint,
      method: 'POST',
      headers: headers,
      body: JSON.stringify(entryDTO),
      types: [
        {
          type: GLOSSARY_CREATE_REQUEST,
          payload: (action, state) => {
            return term
          }
        },
        {
          type: GLOSSARY_CREATE_SUCCESS,
          payload: (action, state, res) => {
            return res.json().then((json) => {
              dispatch(getGlossaryStats(dispatch))
              return json
            })
          }
        },
        GLOSSARY_CREATE_FAILURE
      ]
    }
  }
}

export const updateGlossaryTerm = (dispatch, term) => {
  let headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  if (Configs.auth) {
    headers['x-auth-token'] = Configs.auth.token
    headers['x-auth-user'] = Configs.auth.user
  }
  const endpoint = Configs.API_ROOT + 'glossary/entries'
  const entryDTO = GlossaryHelper.convertToDTO(term)
  return {
    [CALL_API]: {
      endpoint,
      method: 'POST',
      headers: headers,
      body: JSON.stringify(entryDTO),
      types: [
        {
          type: GLOSSARY_UPDATE_REQUEST,
          payload: (action, state) => {
            return term
          }
        },
        {
          type: GLOSSARY_UPDATE_SUCCESS,
          payload: (action, state, res) => {
            return res.json().then((json) => {
              dispatch(getGlossaryStats(dispatch))
              return json
            })
          }
        },
        GLOSSARY_UPDATE_FAILURE
      ]
    }
  }
}

export const deleteGlossaryTerm = (dispatch, id) => {
  let headers = {
    'Accept': 'application/json'
  }
  if (Configs.auth) {
    headers['x-auth-token'] = Configs.auth.token
    headers['x-auth-user'] = Configs.auth.user
  }

  const endpoint = Configs.API_ROOT + 'glossary/entries/' + id
  return {
    [CALL_API]: {
      endpoint,
      method: 'DELETE',
      headers: headers,
      types: [
        GLOSSARY_DELETE_REQUEST,
        {
          type: GLOSSARY_DELETE_SUCCESS,
          payload: (action, state, res) => {
            return res.json().then((json) => {
              dispatch(getGlossaryStats(dispatch))
              return json
            })
          }
        },
        GLOSSARY_DELETE_FAILURE
      ]
    }
  }
}

export const getGlossaryTerms = (state, newIndex) => {
  const {
    src = 'en-US',
    locale = '',
    filter = '',
    sort = '',
    index = 0
  } = state.glossary
  const page = newIndex ? getPageNumber(newIndex) : getPageNumber(index)
  const srcQuery = src
    ? `?srcLocale=${src}` : '?srcLocale=en-US'
  const localeQuery = locale ? `&transLocale=${locale}` : ''
  const pageQuery = `&page=${page}&sizePerPage=${GLOSSARY_PAGE_SIZE}`
  const filterQuery = filter ? `&filter=${filter}` : ''
  const sortQuery = sort ? `&sort=${GlossaryHelper.convertSortToParam(sort)}` : ''
  const endpoint = Configs.API_ROOT + 'glossary/entries' + srcQuery +
    localeQuery + pageQuery + filterQuery + sortQuery
  console.log(endpoint)
  let headers = {
    'Accept': 'application/json'
  }
  if (Configs.auth) {
    headers['x-auth-token'] = Configs.auth.token
    headers['x-auth-user'] = Configs.auth.user
  }
  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      headers: headers,
      types: [
        GLOSSARY_TERMS_REQUEST,
        {
          type: GLOSSARY_TERMS_SUCCESS,
          payload: (action, state, res) => {
            const contentType = res.headers.get('Content-Type')
            if (contentType && ~contentType.indexOf('json')) {
              return res.json().then((json) => {
                const normalized =
                  normalize(json, { results: arrayOf(glossaryTerm) })
                console.log(json, normalized)
                return normalized
              }
              )
            }
          },
          meta: {
            page,
            receivedAt: Date.now()
          }
        },
        GLOSSARY_TERMS_FAILURE
      ]
    }
  }
}

const shouldFetchTerms = (state, newIndex) => {
  const {
    pagesLoaded,
    terms,
    termsDidInvalidate,
    termsLoading
  } = state.glossary
  const newPage = getPageNumber(newIndex)
  const isNewPage = pagesLoaded.indexOf(newPage) === -1
  // Find page in pagesLoaded
  if (isEmpty(terms)) {
    return true
  } else if (termsLoading) {
    return false
  } else if (isNewPage) {
    return true
  } else {
    return termsDidInvalidate
  }
}

export const glossaryGetTermsIfNeeded = (newIndex) => {
  return (dispatch, getState) => {
    if (shouldFetchTerms(getState(), newIndex)) {
      return dispatch(getGlossaryTerms(getState(), newIndex))
    }
  }
}

export const glossaryInvalidateStats =
  createAction(GLOSSARY_INVALIDATE_STATS)

export const getGlossaryStats = (dispatch) => {
  return {
    [CALL_API]: {
      endpoint: Configs.API_ROOT + 'glossary/info',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-auth-token': Configs.auth ? Configs.auth.token : '',
        'x-auth-user': Configs.auth ? Configs.auth.user : ''
      },
      types: [
        GLOSSARY_STATS_REQUEST,
        {
          type: GLOSSARY_STATS_SUCCESS,
          payload: (action, state, res) => {
            return res.json().then((json) => {
              dispatch(getGlossaryTerms(state))
              return json
            })
          }
        },
        GLOSSARY_STATS_FAILURE
      ]
    }
  }
}

export const glossaryInitStateFromUrl =
  createAction(GLOSSARY_INIT_STATE_FROM_URL)

export const glossaryInitialLoad = () => {
  return (dispatch, getState) => {
    const query = getState().routing.location.query
    dispatch(glossaryInitStateFromUrl(query))
    dispatch(getGlossaryStats(dispatch))
  }
}

export const glossaryChangeLocale = (locale) => {
  return (dispatch, getState) => {
    replaceRouteQuery(getState().routing.location, {
      locale: locale
    })
    dispatch(glossaryUpdateLocale(locale))
    dispatch(getGlossaryTerms(getState()))
  }
}

export const glossaryFilterTextChanged = (newFilter) => {
  return (dispatch, getState) => {
    if (!getState().glossary.termsLoading) {
      replaceRouteQuery(getState().routing.location, {
        filter: newFilter
      })
      dispatch(glossaryUpdateFilter(newFilter))
      dispatch(getGlossaryTerms(getState()))
    }
  }
}

export const glossaryDeleteTerm = (id) => {
  return (dispatch, getState) => {
    dispatch(deleteGlossaryTerm(dispatch, id))
  }
}

export const glossaryUpdateTerm = (term) => {
  return (dispatch, getState) => {
    dispatch(updateGlossaryTerm(dispatch, term))
  }
}

export const glossaryCreateNewEntry = (entry) => {
  return (dispatch, getState) => {
    dispatch(createGlossaryTerm(dispatch, entry))
  }
}

export const glossaryImportFile = () => {
  return (dispatch, getState) => {
    dispatch(importGlossaryFile(dispatch,
      getState().glossary.importFile,
      getState().glossary.stats.srcLocale.locale.localeId))
  }
}

export const glossarySelectTerm = (termId) => {
  return (dispatch, getState) => {
    const selectedTerm = getState().glossary.selectedTerm
    if (selectedTerm && selectedTerm.id !== termId) {
      const status = selectedTerm.status
      if (status && (status.isSrcModified || status.isTransModified)) {
        dispatch(glossaryUpdateTerm(cloneDeep(selectedTerm)))
      }
    }
    dispatch(updateSelectedTerm(termId))
  }
}

export const glossarySortColumn = (col) => {
  return (dispatch, getState) => {
    let sort = {}
    sort[col] = getState().glossary.sort[col]
      ? !getState().glossary.sort[col] : true

    replaceRouteQuery(getState().routing.location, {
      sort: GlossaryHelper.convertSortToParam(sort)
    })
    dispatch(glossaryUpdateColSort(sort)).then(
      dispatch(getGlossaryTerms(getState()))
    )
  }
}
