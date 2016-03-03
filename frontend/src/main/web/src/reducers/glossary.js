import { handleActions } from 'redux-actions'
import { union, isEmpty } from 'lodash'
import {
  GLOSSARY_UPDATE_INDEX,
  GLOSSARY_UPDATE_LOCALE,
  GLOSSARY_UPDATE_FILTER,
  GLOSSARY_INIT_STATE_FROM_URL,
  GLOSSARY_TERMS_INVALIDATE,
  GLOSSARY_TERMS_REQUEST,
  GLOSSARY_TERMS_SUCCESS,
  GLOSSARY_TERMS_FAILURE,
  GLOSSARY_STATS_INVALIDATE,
  GLOSSARY_STATS_REQUEST,
  GLOSSARY_STATS_SUCCESS,
  GLOSSARY_STATS_FAILURE,
  GLOSSARY_SELECT_TERM,
  GLOSSARY_PAGE_SIZE,
  GLOSSARY_UPDATE_FIELD
} from '../actions/glossary'

const glossary = handleActions({
  [GLOSSARY_INIT_STATE_FROM_URL]: (state, action) => ({
    ...state,
    src: action.payload.src || 'en-US',
    locale: action.payload.locale || '',
    filter: action.payload.filter || '',
    sort: action.payload.sort || '',
    index: action.payload.index || 0
  }),
  [GLOSSARY_UPDATE_INDEX]: (state, action) => ({
    ...state,
    index: action.payload
  }),
  [GLOSSARY_UPDATE_LOCALE]: (state, action) => ({
    ...state,
    locale: action.payload
  }),
  [GLOSSARY_UPDATE_FILTER]: (state, action) => ({
    ...state,
    filter: action.payload
  }),
  [GLOSSARY_UPDATE_FIELD]: (state, action) => {
    // TODO: Rethink how updating fields happens
    let newSelectedTerm = { ...state.selectedTerm }
    switch (action.payload.field) {
      case 'src':
        newSelectedTerm.glossaryTerms[0].content = action.payload.value
        break
      case 'locale':
        newSelectedTerm.glossaryTerms[1].content = action.payload.value
        break
      case 'pos':
        newSelectedTerm.pos = action.payload.value
        break
      case 'description':
        newSelectedTerm.description = action.payload.value
        break
      default: console.error('Not a valid field')
    }
    return {
      ...state,
      selectedTerm: newSelectedTerm
    }
  },
  [GLOSSARY_STATS_INVALIDATE]: (state, action) => ({
    ...state,
    statsDidInvalidate: true
  }),
  [GLOSSARY_STATS_REQUEST]: (state, action) => ({
    ...state,
    statsError: false,
    statsLoading: true
  }),
  [GLOSSARY_STATS_SUCCESS]: (state, action) => {
    return ({
      ...state,
      stats: {
        srcLocale: action.payload.srcLocale,
        transLocales: action.payload.transLocale.map(result => ({
          value: result.locale.localeId,
          label: result.locale.displayName,
          count: result.numberOfTerms
        }))
      },
      statsLoading: false
    })
  },
  [GLOSSARY_STATS_FAILURE]: (state, action) => ({
    ...state,
    statsError: true,
    statsErrorMessage: action.payload,
    statsLoading: false
  }),
  [GLOSSARY_TERMS_INVALIDATE]: (state, action) => ({
    ...state,
    termsDidInvalidate: true
  }),
  [GLOSSARY_TERMS_REQUEST]: (state, action) => ({
    ...state,
    termsError: action.error,
    termsErrorMessage: action.payload,
    termsLoading: true
  }),
  [GLOSSARY_TERMS_SUCCESS]: (state, action) => {
    const page = action.meta.page
    const pagesLoaded = union(state.pagesLoaded, [page])
    let termIds = isEmpty(state.termIds)
      ? new Array(action.payload.result.totalCount)
      : state.termIds
    const terms = isEmpty(state.terms)
      ? action.payload.entities.glossaryTerms
      : { ...state.terms, ...action.payload.entities.glossaryTerms }
    termIds
      .splice(
        (page - 1) * GLOSSARY_PAGE_SIZE,
        action.payload.result.results.length,
        ...action.payload.result.results
      )
    return ({
      ...state,
      termsLoading: false,
      termsLastUpdated: action.meta.receivedAt,
      terms,
      termIds,
      termCount: action.payload.result.totalCount,
      page,
      pagesLoaded
    })
  },
  [GLOSSARY_TERMS_FAILURE]: (state, action) => ({
    ...state,
    termsError: action.error,
    termsErrorMessage: action.payload,
    termsLoading: false
  }),
  [GLOSSARY_SELECT_TERM]: (state, action) => ({
    ...state,
    selectedTerm: action.payload
  })
}, {
  src: 'en-US',
  locale: '',
  filter: '',
  sort: '',
  index: 0,
  selectedTerm: {},
  page: 1,
  pagesLoaded: [],
  canAddNewEntry: false,
  canUpdateEntry: false,
  canDeleteEntry: false,
  terms: {},
  termIds: [],
  termCount: 0,
  termsError: false,
  termsLoading: true,
  termsDidInvalidate: false,
  stats: {
    srcLocale: [],
    transLocales: []
  },
  statsError: false,
  statsLoading: true,
  statsDidInvalidate: false
})

export default glossary
