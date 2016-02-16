import { handleActions } from 'redux-actions'
import {
  GLOSSARY_ENTRIES_REQUEST,
  GLOSSARY_ENTRIES_SUCCESS,
  GLOSSARY_ENTRIES_FAILURE,
  GLOSSARY_STATS_REQUEST,
  GLOSSARY_STATS_SUCCESS,
  GLOSSARY_STATS_FAILURE,
  GLOSSARY_UPDATE_LOCALE,
  GLOSSARY_PAGE_SIZE
} from '../actions/glossary'

export default handleActions({
  [GLOSSARY_ENTRIES_REQUEST]: (state, action) => ({
    ...state,
    entries: {
      ...state.entries,
      error: action.error,
      errorMessage: action.payload,
      loading: true
    }
  }),
  [GLOSSARY_ENTRIES_SUCCESS]: (state, action) => {
    const page = action.meta.page || 1
    let results = state.entries.results || new Array(action.payload.totalCount)
    results
      .splice(
        (page - 1) * GLOSSARY_PAGE_SIZE,
        action.payload.results.length,
        ...action.payload.results
      )
    return ({
      ...state,
      entries: {
        results,
        totalCount: action.payload.totalCount,
        page,
        loading: false
      }
    })
  },
  [GLOSSARY_ENTRIES_FAILURE]: (state, action) => ({
    ...state,
    entries: {
      ...state.entries,
      error: action.error,
      errorMessage: action.payload,
      loading: false
    }
  }),
  [GLOSSARY_STATS_REQUEST]: (state, action) => ({
    ...state,
    stats: {
      ...state.stats,
      error: false,
      loading: true
    }
  }),
  [GLOSSARY_STATS_SUCCESS]: (state, action) => {
    return ({
      ...state,
      stats: {
        ...state.stats,
        results: {
          srcLocale: action.payload.srcLocale,
          transLocale: action.payload.transLocale.map(result => ({
            value: result.locale.localeId,
            label: result.locale.displayName,
            count: result.numberOfTerms
          }))
        },
        loading: false
      }
    })
  },
  [GLOSSARY_STATS_FAILURE]: (state, action) => ({
    ...state,
    stats: {
      ...state.stats,
      error: true,
      errorMessage: action.payload,
      loading: false
    }
  }),
  [GLOSSARY_UPDATE_LOCALE]: (state, action) => ({
    ...state,
    selectedTransLocale: action.payload
  })
}, {
  entries: {
    error: false,
    loading: true
  },
  stats: {
    error: false,
    loading: true
  },
  selectedTransLocale: null
})
