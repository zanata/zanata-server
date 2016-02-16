import { createAction } from 'redux-actions'
import { CALL_API } from 'redux-api-middleware'
import { forOwn } from 'lodash'
import { browserHistory } from 'react-router'

// const API_ROOT = 'http://localhost:8080/zanata/rest/'
const API_ROOT = 'https://translate.zanata.org/zanata/rest/'
export const GLOSSARY_PAGE_SIZE = 1000

export const GLOSSARY_ENTRIES_REQUEST = 'GLOSSARY_ENTRIES_REQUEST'
export const GLOSSARY_ENTRIES_SUCCESS = 'GLOSSARY_ENTRIES_SUCCESS'
export const GLOSSARY_ENTRIES_FAILURE = 'GLOSSARY_ENTRIES_FAILURE'

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

export const getGlossaryEntries = (
  srcLocale,
  transLocale,
  filter,
  sort,
  page,
  pageSize = GLOSSARY_PAGE_SIZE
) => {
  const srcLocaleQuery = srcLocale
    ? `?srcLocale=${srcLocale}` : '?srcLocale=en-US'
  const transLocaleQuery = transLocale ? `&transLocale=${transLocale}` : ''
  const pageQuery = page ? `&page=${page}&sizePerPage=${pageSize}` : ''
  const filterQuery = filter ? `&filter=${filter}` : ''
  const sortQuery = sort ? generateSortOrderParam(sort) : ''
  const endpoint = API_ROOT + 'glossary/entries' + srcLocaleQuery +
    transLocaleQuery + pageQuery + filterQuery + sortQuery
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
              // Just making sure res.json() does not raise an error
              return res.json()
                .then((json) => json)
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

export const GLOSSARY_STATS_REQUEST = 'GLOSSARY_STATS_REQUEST'
export const GLOSSARY_STATS_SUCCESS = 'GLOSSARY_STATS_SUCCESS'
export const GLOSSARY_STATS_FAILURE = 'GLOSSARY_STATS_FAILURE'

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

export const glossaryLoadPage = (page, forceLoad) => {
  return (dispatch, getState) => {
    const {
      routing,
      glossary
    } = getState()
    const {
      src = 'en-US',
      locale = '',
      filter = '',
      sort = '',
      index = 0
    } = routing.location.query
    const page = page || getPageNumber(index)
    // Check if this data has already been fetched
    if (!forceLoad && glossary.entries.results &&
      glossary.entries.results[((page - 1) * GLOSSARY_PAGE_SIZE)]) {
      return
    } else if (!glossary.loading) {
      dispatch(getGlossaryEntries(src, locale, filter, sort, page))
    }
  }
}

export const glossaryMounted = () => {
  return (dispatch, getState) => {
    const index = getState().routing.location.query.index || 0
    const page = getPageNumber(index)
    dispatch(glossaryLoadPage(page, true))
    dispatch(getGlossaryStats())
  }
}

export const glossaryScrolled = (indexRange) => {
  return (dispatch, getState) => {
    const loadingThreshold = 250
    const newIndex = indexRange[0]
    const newIndexEnd = indexRange[1]
    const location = getState().routing.location
    const oldIndex = location.query.index
    const oldPage = getPageNumber(oldIndex)
    const newPage = getPageNumber(newIndex)
    // If close enough, load the prev/next page too
    const prevPage = getPageNumber(newIndex - loadingThreshold)
    const nextPage = getPageNumber(newIndexEnd + loadingThreshold)
    browserHistory.replace({
      ...location,
      query: {
        ...location.query,
        index: newIndex
      }
    })
    if (oldPage !== newPage) {
      dispatch(glossaryLoadPage(newPage))
    }
    if ((oldPage !== prevPage) || (newPage !== prevPage)) {
      dispatch(glossaryLoadPage(prevPage))
    }
    if ((oldPage !== nextPage) || (newPage !== nextPage)) {
      dispatch(glossaryLoadPage(nextPage))
    }
  }
}

export const GLOSSARY_UPDATE_LOCALE = 'GLOSSARY_UPDATE_LOCALE'
export const glossaryUpdateLocale = createAction(GLOSSARY_UPDATE_LOCALE)

export const glossaryChangeLocale = (localeId) => {
  return (dispatch, getState) => {
    const location = getState().routing.location
    if (location.query.locale === localeId) {
      return
    }
    if (localeId) {
      location.query = {
        ...location.query,
        locale: localeId
      }
    } else {
      delete location.query.locale
    }
    browserHistory.replace({
      ...location
    })
    dispatch(glossaryLoadPage(null, true))
  }
}

export const glossaryFilterTextChanged = (newFilter) => {
  return (dispatch, getState) => {
    const location = getState().routing.location
    if (location.query.filter === newFilter) {
      return
    }
    if (newFilter) {
      location.query = {
        ...location.query,
        filter: newFilter
      }
    } else {
      delete location.query.filter
    }
    browserHistory.replace({
      ...location
    })
    if (!getState().glossary.entries.loading) {
      return dispatch(glossaryLoadPage(null, true))
    }
  }
}
