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

export const getSearchProjectResults = (searchText) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/search/projects?q=' + searchText
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

export const getSearchLanguageTeamResults = (searchText) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/search/teams/language?q=' + searchText
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

export const getSearchPeopleResults = (searchText) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/search/people?q=' + searchText
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

export const getSearchGroupResults = (searchText) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/search/groups?q=' + searchText
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

const search = (dispatch, searchText) => {
  if (searchText) {
    dispatch(getSearchProjectResults(searchText))
    dispatch(getSearchLanguageTeamResults(searchText))
    dispatch(getSearchPeopleResults(searchText))
    dispatch(getSearchGroupResults(searchText))
  } else {
    dispatch(searchDefaultReturned())
  }
}

export const searchPageLoaded = () => {
  return (dispatch, getState) => {
    const searchText = getState().routing.location.query.q
    search(dispatch, searchText)
  }
}

export const searchTextChanged = (searchText) => {
  return (dispatch, getState) => {
    replaceRouteQuery(getState().routing.location, {
      q: searchText
    })
    search(dispatch, searchText)
  }
}
