import { createAction } from 'redux-actions'
import { CALL_API } from 'redux-api-middleware'
import { forOwn } from 'lodash'
import { arrayOf, normalize } from 'normalizr'
import { glossaryTerm } from '../schemas'
import { replaceRouteQuery } from '../utils/RoutingHelpers'

// const API_ROOT = 'http://localhost:8080/zanata/rest/'
const API_ROOT = 'https://translate.zanata.org/zanata/rest/'
export const GLOSSARY_PAGE_SIZE = 1000
export const GLOSSARY_UPDATE_INDEX = 'GLOSSARY_UPDATE_INDEX'
export const GLOSSARY_INVALIDATE_RESULTS = 'GLOSSARY_INVALIDATE_RESULTS'
export const GLOSSARY_UPDATE_LOCALE = 'GLOSSARY_UPDATE_LOCALE'
export const GLOSSARY_ENTRIES_INVALIDATE = 'GLOSSARY_ENTRIES_INVALIDATE'
export const GLOSSARY_ENTRIES_REQUEST = 'GLOSSARY_ENTRIES_REQUEST'
export const GLOSSARY_ENTRIES_SUCCESS = 'GLOSSARY_ENTRIES_SUCCESS'
export const GLOSSARY_ENTRIES_FAILURE = 'GLOSSARY_ENTRIES_FAILURE'
export const GLOSSARY_INVALIDATE_STATS = 'GLOSSARY_INVALIDATE_STATS'
export const GLOSSARY_STATS_REQUEST = 'GLOSSARY_STATS_REQUEST'
export const GLOSSARY_STATS_SUCCESS = 'GLOSSARY_STATS_SUCCESS'
export const GLOSSARY_STATS_FAILURE = 'GLOSSARY_STATS_FAILURE'

export const glossaryUpdateIndex = createAction(GLOSSARY_UPDATE_INDEX)

export const glossaryUpdateLocale = createAction(GLOSSARY_UPDATE_LOCALE)

const getPageNumber =
  (index) => Math.floor(index / GLOSSARY_PAGE_SIZE) + 1

const generateSortOrderParam = (sort) => {
  var params = []
  forOwn(sort, function (value, field) {
    var param = (value ? '' : '-') + field
    params.push(param)
  })
  return params.length ? '&sort=' + params.join() : ''
}

export const glossaryInvalidateResults =
  createAction(GLOSSARY_INVALIDATE_RESULTS)

export const getGlossaryEntries = (state, newIndex) => {
  const {
    src = 'en-US',
    locale = '',
    filter = '',
    sort = '',
    index = 0
  } = state.glossary.details
  const page = newIndex ? getPageNumber(newIndex) : getPageNumber(index)
  const srcQuery = src
    ? `?srcLocale=${src}` : '?srcLocale=en-US'
  const localeQuery = locale ? `&transLocale=${locale}` : ''
  const pageQuery = `&page=${page}&sizePerPage=${GLOSSARY_PAGE_SIZE}`
  const filterQuery = filter ? `&filter=${filter}` : ''
  const sortQuery = sort ? generateSortOrderParam(sort) : ''
  const endpoint = API_ROOT + 'glossary/entries' + srcQuery +
    localeQuery + pageQuery + filterQuery + sortQuery
  console.log(endpoint)
  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      types: [
        GLOSSARY_ENTRIES_REQUEST,
        {
          type: GLOSSARY_ENTRIES_SUCCESS,
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
        GLOSSARY_ENTRIES_FAILURE
      ]
    }
  }
}

const shouldFetchEntries = (state, newIndex) => {
  const entries = state.glossary.entries
  const pagesLoaded = state.glossary.entries.pagesLoaded
  const newPage = getPageNumber(newIndex)
  const isNewPage = pagesLoaded.indexOf(newPage) === -1
  // Find page in pagesLoaded
  if (!entries) {
    return true
  } else if (entries.loading) {
    return false
  } else if (isNewPage) {
    return true
  } else {
    return entries.didInvalidate
  }
}

export const glossaryGetEntriesIfNeeded = (newIndex) => {
  return (dispatch, getState) => {
    if (shouldFetchEntries(getState(), newIndex)) {
      return dispatch(getGlossaryEntries(getState(), newIndex))
    }
  }
}

export const glossaryInvalidateStats =
  createAction(GLOSSARY_INVALIDATE_STATS)

export const getGlossaryStats = () => {
  return {
    [CALL_API]: {
      endpoint: API_ROOT + '/glossary/info',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      types: [
        GLOSSARY_STATS_REQUEST,
        GLOSSARY_STATS_SUCCESS,
        GLOSSARY_STATS_FAILURE
      ]
    }
  }
}

export const glossaryInitialLoad = () => {
  return (dispatch, getState) => {
    const index = getState().routing.location.query.index || 0
    dispatch(getGlossaryEntries(getState(), index))
    dispatch(getGlossaryStats())
  }
}

export const glossaryChangeLocale = (locale) => {
  return (dispatch, getState) => {
    replaceRouteQuery(getState().routing.location, {
      locale: locale
    })
    dispatch(getGlossaryEntries(getState()))
  }
}

export const glossaryFilterTextChanged = (newFilter) => {
  return (dispatch, getState) => {
    if (!getState().glossary.entries.loading) {
      replaceRouteQuery(getState().routing.location, {
        filter: newFilter
      })
      return dispatch(getGlossaryEntries(getState()))
    }
  }
}
