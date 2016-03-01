import { combineReducers } from 'redux'
import { handleActions } from 'redux-actions'
import { union } from 'lodash'
import {
  GLOSSARY_UPDATE_INDEX,
  GLOSSARY_ENTRIES_INVALIDATE,
  GLOSSARY_ENTRIES_REQUEST,
  GLOSSARY_ENTRIES_SUCCESS,
  GLOSSARY_ENTRIES_FAILURE,
  GLOSSARY_STATS_INVALIDATE,
  GLOSSARY_STATS_REQUEST,
  GLOSSARY_STATS_SUCCESS,
  GLOSSARY_STATS_FAILURE,
  GLOSSARY_UPDATE_LOCALE,
  GLOSSARY_PAGE_SIZE
} from '../actions/glossary'

const entries = handleActions({
  [GLOSSARY_ENTRIES_INVALIDATE]: (state, action) => ({
    ...state,
    didInvalidate: true
  }),
  [GLOSSARY_ENTRIES_REQUEST]: (state, action) => ({
    ...state,
    error: action.error,
    errorMessage: action.payload,
    loading: true
  }),
  [GLOSSARY_ENTRIES_SUCCESS]: (state, action) => {
    const page = action.meta.page
    const pagesLoaded = state.pagesLoaded
      ? union(state.pagesLoaded, [page])
      : [page]
    let termIds = state.termIds || new Array(action.payload.result.totalCount)
    const terms = state.terms
      ? { ...state.terms, ...action.payload.entities.glossaryTerms }
      : action.payload.entities.glossaryTerms
    termIds
      .splice(
        (page - 1) * GLOSSARY_PAGE_SIZE,
        action.payload.result.results.length,
        ...action.payload.result.results
      )
    return ({
      ...state,
      loading: false,
      lastUpdated: action.meta.receivedAt,
      terms,
      termIds,
      totalCount: action.payload.result.totalCount,
      page,
      pagesLoaded
    })
  },
  [GLOSSARY_ENTRIES_FAILURE]: (state, action) => ({
    ...state,
    error: action.error,
    errorMessage: action.payload,
    loading: false
  })
}, {
  error: false,
  loading: true,
  didInvalidate: false
})

const stats = handleActions({
  [GLOSSARY_STATS_INVALIDATE]: (state, action) => ({
    ...state,
    didInvalidate: true
  }),
  [GLOSSARY_STATS_REQUEST]: (state, action) => ({
    ...state,
    error: false,
    loading: true
  }),
  [GLOSSARY_STATS_SUCCESS]: (state, action) => {
    return ({
      ...state,
      results: {
        srcLocale: action.payload.srcLocale,
        transLocale: action.payload.transLocale.map(result => ({
          value: result.locale.localeId,
          label: result.locale.displayName,
          count: result.numberOfTerms
        }))
      },
      loading: false
    })
  },
  [GLOSSARY_STATS_FAILURE]: (state, action) => ({
    ...state,
    error: true,
    errorMessage: action.payload,
    loading: false
  })
}, {
  error: false,
  loading: true,
  didInvalidate: false
})

const details = handleActions({
  [GLOSSARY_UPDATE_INDEX]: (state, action) => ({
    ...state,
    index: action.payload
  }),
  [GLOSSARY_UPDATE_LOCALE]: (state, action) => ({
    ...state,
    locale: action.payload
  })
}, {
  src: 'en-US',
  locale: '',
  filter: '',
  sort: '',
  index: 0
})

export default combineReducers({
  entries,
  stats,
  details
})
