import { createAction } from 'redux-actions'
import { CALL_API } from 'redux-api-middleware'
import { normalize } from 'normalizr'
import { SEARCH_RESULTS } from '../schemas'

export const SEARCH_DEFAULT_RETURNED = 'SEARCH_DEFAULT_RETURNED'
export const searchDefaultReturned = createAction(SEARCH_DEFAULT_RETURNED)

export const SEARCH_REQUEST = 'SEARCH_REQUEST'
export const SEARCH_SUCCESS = 'SEARCH_SUCCESS'
export const SEARCH_FAILURE = 'SEARCH_FAILURE'

export const getSearchResults = (searchText) => {
  const endpoint = `search?q=${searchText}`
  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      types: [
        SEARCH_REQUEST,
        {
          type: SEARCH_SUCCESS,
          payload: (action, state, res) => {
            const contentType = res.headers.get('Content-Type')
            if (contentType && ~contentType.indexOf('json')) {
              return res.json().then((json) => {
                const normalized =
                  normalize(json, { results: SEARCH_RESULTS })
                return normalized
              }
              )
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

export const searchTextChanged = () => {
  return (dispatch, getState) => {
    const searchText = getState().routing.location.query.q
    if (searchText) {
      dispatch(getSearchResults(searchText))
    }
  }
}
