import { createAction } from 'redux-actions'
import { CALL_API } from 'redux-api-middleware'
import { normalize } from 'normalizr'
import { forEach } from 'lodash'
import { SEARCH_RESULTS } from '../schemas'
import { replaceRouteQuery } from '../utils/RoutingHelpers'

export const SEARCH_DEFAULT_RETURNED = 'SEARCH_DEFAULT_RETURNED'
export const searchDefaultReturned = createAction(SEARCH_DEFAULT_RETURNED)

export const SEARCH_REQUEST = 'SEARCH_REQUEST'
export const SEARCH_SUCCESS = 'SEARCH_SUCCESS'
export const SEARCH_FAILURE = 'SEARCH_FAILURE'

const normalisedSearch = (json) => {
  let results = {}
  forEach(json, function (result) {
    results[result.type] = result
  })
  return results
}

export const getSearchResults = (searchText) => {
  let headers = {
    'Accept': 'application/json'
  }
  if (window.config.auth) {
    headers['x-auth-token'] = window.config.auth.token
    headers['x-auth-user'] = window.config.auth.user
  }
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/search?q=' + searchText

  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      headers: headers,
      types: [
        SEARCH_REQUEST,
        {
          type: SEARCH_SUCCESS,
          payload: (action, state, res) => {
            const contentType = res.headers.get('Content-Type')
            if (contentType && ~contentType.indexOf('json')) {
              return res.json().then((json) => {
                return normalisedSearch(json)
              })
            }
          },
          meta: {
            receivedAt: Date.now()
          }
        },
        SEARCH_FAILURE
      ]
    }
  }
}

export const searchPageLoaded = () => {
  return (dispatch, getState) => {
    const searchText = getState().routing.location.query.q
    if (searchText) {
      dispatch(getSearchResults(searchText))
    }
  }
}

export const searchTextChanged = (searchText) => {
  return (dispatch, getState) => {
    replaceRouteQuery(getState().routing.location, {
      q: searchText
    })
    if (searchText) {
      dispatch(getSearchResults(searchText))
    }
  }
}
