import { CALL_API } from 'redux-api-middleware'
import { normalize } from 'normalizr'
import { SEARCH_RESULTS } from '../schemas'
import { replaceRouteQuery } from '../utils/RoutingHelpers'
import { getJsonHeaders, buildAPIRequest } from './common'
import { isEmpty } from 'lodash'

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

export const SIZE_PER_PAGE = 2

const getEndpoint = (type, page, searchText) => {
  return window.config.baseUrl + window.config.apiRoot + '/search/' +
    type + '?' +
    'sizePerPage=' + SIZE_PER_PAGE +
    '&page=' + (page ? page : '1') +
    (searchText ? '&q=' + searchText : '')
}

const handleCallbacks = (callbacks, dispatch, searchText, pages) => {
  if (callbacks) {
    const callback = callbacks[0]
    dispatch(callback(dispatch, searchText, pages,
      callbacks.splice(1)))
  }
}

const getSearchProjectResults = (dispatch, searchText, pages, callbacks) => {
  const endpoint = getEndpoint('projects', pages.projectPage, searchText)
  const apiTypes = [
    SEARCH_PROJECT_REQUEST,
    {
      type: SEARCH_PROJECT_SUCCESS,
      payload: (action, state, res) => {
        const contentType = res.headers.get('Content-Type')
        if (contentType && ~contentType.indexOf('json')) {
          return res.json().then((json) => {
            !isEmpty(callbacks) &&
            handleCallbacks(callbacks, dispatch, searchText, pages)
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
  return {
    [CALL_API]: buildAPIRequest(endpoint, 'GET', getJsonHeaders(), apiTypes)
  }
}

const getSearchLanguageTeamResults = (dispatch, searchText, pages, callbacks) => {
  const endpoint = getEndpoint('teams/language', pages.languageTeamPage, searchText)
  const apiTypes = [
    SEARCH_LANG_TEAM_REQUEST,
    {
      type: SEARCH_LANG_TEAM_SUCCESS,
      payload: (action, state, res) => {
        const contentType = res.headers.get('Content-Type')
        if (contentType && ~contentType.indexOf('json')) {
          return res.json().then((json) => {
            !isEmpty(callbacks) &&
            handleCallbacks(callbacks, dispatch, searchText, pages)
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
  return {
    [CALL_API]: buildAPIRequest(endpoint, 'GET', getJsonHeaders(), apiTypes)
  }
}

const getSearchPeopleResults = (dispatch, searchText, pages, callbacks) => {
  const endpoint = getEndpoint('people', pages.personPage, searchText)
  const apiTypes = [
    SEARCH_PEOPLE_REQUEST,
    {
      type: SEARCH_PEOPLE_SUCCESS,
      payload: (action, state, res) => {
        const contentType = res.headers.get('Content-Type')
        if (contentType && ~contentType.indexOf('json')) {
          return res.json().then((json) => {
            !isEmpty(callbacks) &&
            handleCallbacks(callbacks, dispatch, searchText, pages)
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
  return {
    [CALL_API]: buildAPIRequest(endpoint, 'GET', getJsonHeaders(), apiTypes)
  }
}

const getSearchGroupResults = (dispatch, searchText, pages, callbacks) => {
  const endpoint = getEndpoint('groups', pages.groupPage, searchText)
  const apiTypes = [
    SEARCH_GROUP_REQUEST,
    {
      type: SEARCH_GROUP_SUCCESS,
      payload: (action, state, res) => {
        const contentType = res.headers.get('Content-Type')
        if (contentType && ~contentType.indexOf('json')) {
          return res.json().then((json) => {
            !isEmpty(callbacks) &&
            handleCallbacks(callbacks, dispatch, searchText, pages)
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
  return {
    [CALL_API]: buildAPIRequest(endpoint, 'GET', getJsonHeaders(), apiTypes)
  }
}

const search = (dispatch, searchText, pages) => {
  if (searchText) {
    dispatch(getSearchProjectResults(dispatch, searchText, pages,
      [getSearchGroupResults, getSearchLanguageTeamResults,
        getSearchPeopleResults]))
  } else {
    dispatch(getSearchProjectResults(dispatch, searchText, pages,
      [getSearchGroupResults]))
  }
}

const queryPageType = {
  'Project': 'projectPage',
  'Group': 'groupPage',
  'Person': 'personPage',
  'LanguageTeam': 'languageTeamPage'
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

      search(dispatch, searchText, {projectPage,
        groupPage, personPage, languageTeamPage})
    }
  }
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

    const query = getState().routing.location.query
    const projectPage = query.projectPage
    const groupPage = query.groupPage
    const personPage = query.personPage
    const languageTeamPage = query.languageTeamPage

    switch (type) {
      case 'Project':
        dispatch(getSearchProjectResults(dispatch, searchText,
          {projectPage: newPage, groupPage, personPage, languageTeamPage}))
        break
      case 'Group':
        dispatch(getSearchGroupResults(dispatch, searchText,
          {projectPage, groupPage: newPage, personPage, languageTeamPage}))
        break
      case 'Person':
        dispatch(getSearchPeopleResults(dispatch, searchText,
          {projectPage, groupPage, personPage: newPage, languageTeamPage}))
        break
      case 'LanguageTeam':
        dispatch(getSearchLanguageTeamResults(dispatch, searchText,
          {projectPage, groupPage, personPage, languageTeamPage: newPage}))
        break
      default:
        break
    }
  }
}

export const searchPageInitialLoad = () => {
  return (dispatch, getState) => {
    const query = getState().routing.location.query
    const searchText = query.q
    const projectPage = query.projectPage
    const groupPage = query.groupPage
    const personPage = query.personPage
    const languageTeamPage = query.languageTeamPage
    search(dispatch, searchText, {projectPage,
      groupPage, personPage, languageTeamPage})
  }
}
