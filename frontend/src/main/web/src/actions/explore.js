import { createAction } from 'redux-actions'
import { CALL_API } from 'redux-api-middleware'
import { normalize } from 'normalizr'
import { SEARCH_RESULTS } from '../schemas'
import { replaceRouteQuery } from '../utils/RoutingHelpers'
import { getJsonHeaders } from './common'

export const EMPTY_SEARCH = 'EMPTY_SEARCH'
export const searchDefaultReturned = createAction(EMPTY_SEARCH)

export const SEARCH_PROJECT_REQUEST = 'SEARCH_PROJECT_REQUEST'
export const SEARCH_PROJECT_SUCCESS = 'SEARCH_PROJECT_SUCCESS'
export const SEARCH_PROJECT_FAILURE = 'SEARCH_PROJECT_FAILURE'

export const SEARCH_LANG_TEAM_REQUEST = 'SEARCH_LANG_TEAM_REQUEST'
export const SEARCH_LANG_TEAM_SUCCESS = 'SEARCH_LANG_TEAM_SUCCESS'
export const SEARCH_LANG_TEAM_FAILURE = 'SEARCH_LANG_TEAM_FAILURE'

export const SEARCH_PEOPLE_REQUEST = 'SEARCH_PEOPLE_REQUEST'
export const SEARCH_PEOPLE_SUCCESS = 'SEARCH_PEOPLE_SUCCESS'
export const SEARCH_PEOPLE_FAILURE = 'SEARCH_PEOPLE_FAILURE'

export const SEARCH_GROUP_REQUEST = 'SEARCH_GROUP_REQUEST'
export const SEARCH_GROUP_SUCCESS = 'SEARCH_GROUP_SUCCESS'
export const SEARCH_GROUP_FAILURE = 'SEARCH_GROUP_FAILURE'

export const SIZE_PER_PAGE = 10

export const getSearchProjectResults = (searchText, page) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/search/projects?' +
    'sizePerPage=' + SIZE_PER_PAGE +
    '&page=' + (page ? page : '1') +
    (searchText ? '&q=' + searchText : '')
  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      headers: getJsonHeaders(),
      types: [
        SEARCH_PROJECT_REQUEST,
        {
          type: SEARCH_PROJECT_SUCCESS,
          payload: (action, state, res) => {
            const contentType = res.headers.get('Content-Type')
            if (contentType && ~contentType.indexOf('json')) {
              return res.json().then((json) => {
                return json
              })
            }
          },
          meta: {
            receivedAt: Date.now()
          }
        },
        SEARCH_PROJECT_FAILURE
      ]
    }
  }
}

export const getSearchLanguageTeamResults = (searchText, page) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/search/teams/language?' +
    'sizePerPage=' + SIZE_PER_PAGE +
    '&page=' + (page ? page : '1') +
    (searchText ? '&q=' + searchText : '')

  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      headers: getJsonHeaders(),
      types: [
        SEARCH_LANG_TEAM_REQUEST,
        {
          type: SEARCH_LANG_TEAM_SUCCESS,
          payload: (action, state, res) => {
            const contentType = res.headers.get('Content-Type')
            if (contentType && ~contentType.indexOf('json')) {
              return res.json().then((json) => {
                return json
              })
            }
          },
          meta: {
            receivedAt: Date.now()
          }
        },
        SEARCH_LANG_TEAM_FAILURE
      ]
    }
  }
}

export const getSearchPeopleResults = (searchText, page) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/search/people?'+
    'sizePerPage=' + SIZE_PER_PAGE +
    '&page=' + (page ? page : '1') +
    (searchText ? '&q=' + searchText : '')

  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      headers: getJsonHeaders(),
      types: [
        SEARCH_PEOPLE_REQUEST,
        {
          type: SEARCH_PEOPLE_SUCCESS,
          payload: (action, state, res) => {
            const contentType = res.headers.get('Content-Type')
            if (contentType && ~contentType.indexOf('json')) {
              return res.json().then((json) => {
                return json
              })
            }
          },
          meta: {
            receivedAt: Date.now()
          }
        },
        SEARCH_PEOPLE_FAILURE
      ]
    }
  }
}

export const getSearchGroupResults = (searchText, page) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/search/groups?'+
    'sizePerPage=' + SIZE_PER_PAGE +
    '&page=' + (page ? page : '1') +
    (searchText ? '&q=' + searchText : '')

  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      headers: getJsonHeaders(),
      types: [
        SEARCH_GROUP_REQUEST,
        {
          type: SEARCH_GROUP_SUCCESS,
          payload: (action, state, res) => {
            const contentType = res.headers.get('Content-Type')
            if (contentType && ~contentType.indexOf('json')) {
              return res.json().then((json) => {
                return json
              })
            }
          },
          meta: {
            receivedAt: Date.now()
          }
        },
        SEARCH_GROUP_FAILURE
      ]
    }
  }
}

const search = (dispatch, searchText, projectPage, groupPage, personPage, languagePage) => {
  dispatch(getSearchProjectResults(searchText, projectPage))
  dispatch(getSearchGroupResults(searchText, groupPage))
  if (searchText) {
    dispatch(getSearchLanguageTeamResults(searchText, languagePage))
    dispatch(getSearchPeopleResults(searchText, personPage))
  }
}

export const searchPageLoaded = () => {
  return (dispatch, getState) => {
    const query = getState().routing.location.query
    const searchText = query.q
    const projectPage = query.projectPage
    const groupPage = query.groupPage
    const personPage = query.personPage
    const languageTeamPage = query.languageTeamPage
    search(dispatch, searchText, projectPage,
        groupPage, personPage, languageTeamPage)
  }
}

export const searchTextChanged = (searchText) => {
  return (dispatch, getState) => {
    if (getState().routing.location !== searchText) {
      replaceRouteQuery(getState().routing.location, {
        q: searchText,
        projectPage: null,
        groupPage: null,
        personPage: null,
        languageTeamPage: null
      })
      const query = getState().routing.location.query
      const projectPage = query.projectPage
      const groupPage = query.groupPage
      const personPage = query.personPage
      const languageTeamPage = query.languageTeamPage
      search(dispatch, searchText, projectPage,
        groupPage, personPage, languageTeamPage)
    }
  }
}

const queryPageType = {
  'Project': 'projectPage',
  'Group': 'groupPage',
  'Person': 'personPage',
  'LanguageTeam': 'languageTeamPage'
}

export const updateSearchPage = (type, currentPage, totalPage, next) => {
  const intCurrentPage = parseInt(currentPage)
  const newPage = next
    ? (intCurrentPage + 1) > totalPage ? totalPage : intCurrentPage + 1
    : (intCurrentPage - 1) < 1 ? 1 : intCurrentPage - 1

  const typePage = queryPageType[type]
  return (dispatch, getState) => {
    let queryObj = {}
    queryObj[typePage] = newPage
    replaceRouteQuery(getState().routing.location, queryObj)
    const searchText = getState().routing.location.query.q

    switch (type) {
      case 'Project':
        dispatch(getSearchProjectResults(searchText, newPage))
        break
      case 'Group':
        dispatch(getSearchGroupResults(searchText, newPage))
        break
      case 'Person':
        dispatch(getSearchPeopleResults(searchText, newPage))
        break
      case 'LanguageTeam':
        dispatch(getSearchLanguageTeamResults(searchText, newPage))
        break
      default:
        break
    }
  }
}
