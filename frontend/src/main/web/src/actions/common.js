import { createAction } from 'redux-actions'
import { CALL_API } from 'redux-api-middleware'

export const CLEAR_MESSAGE = 'CLEAR_MESSAGE'
export const GET_LOCALE_LIST_REQUEST = 'GET_LOCALE_LIST_REQUEST'
export const GET_LOCALE_LIST_SUCCESS = 'GET_LOCALE_LIST_SUCCESS'
export const GET_LOCALE_LIST_FAILURE = 'GET_LOCALE_LIST_FAILURE'

export const UPDATE_LOCALE_REQUEST = 'UPDATE_LOCALE_REQUEST'
export const UPDATE_LOCALE_SUCCESS = 'UPDATE_LOCALE_SUCCESS'
export const UPDATE_LOCALE_FAILURE = 'UPDATE_LOCALE_FAILURE'

export const UPDATE_UI_LOCALE = 'UPDATE_UI_LOCALE'

export const clearMessage = createAction(CLEAR_MESSAGE)
export const updateUILocale = createAction(UPDATE_UI_LOCALE)

export const SEVERITY = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
}

export const DEFAULT_LOCALE = {
  'localeId': 'en-US',
  'displayName': 'English (United States)'
}

export const getJsonHeaders = () => {
  let headers = {'Accept': 'application/json'}
  if (window.config.auth) {
    headers['x-auth-token'] = window.config.auth.token
    headers['x-auth-user'] = window.config.auth.user
  }
  return headers
}

export const requestUpdateLocale = (locale) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/locales/system/' + locale
  return {
    [CALL_API]: {
      endpoint,
      method: 'POST',
      headers: getJsonHeaders(),
      types: [
        UPDATE_LOCALE_REQUEST,
        {
          type: UPDATE_LOCALE_SUCCESS,
          payload: (action, state, res) => {
            return res.json().then((json) => {
              return json
            })
          }
        },
        UPDATE_LOCALE_FAILURE
      ]
    }
  }
}

export const getUILocales = () => {
  const endpoint = window.config.baseUrl + window.config.apiRoot +
    '/locales/system'
  return {
    [CALL_API]: {
      endpoint,
      method: 'GET',
      headers: getJsonHeaders(),
      types: [
        GET_LOCALE_LIST_REQUEST,
        {
          type: GET_LOCALE_LIST_SUCCESS,
          payload: (action, state, res) => {
            return res.json().then((json) => {
              return json
            })
          }
        },
        GET_LOCALE_LIST_FAILURE
      ]
    }
  }
}

export const updateLocale = (locale) => {
  return (dispatch, getState) => {
    dispatch(updateUILocale(locale)).then(
      dispatch(requestUpdateLocale(locale)))
  }
}

export const initialLoad = () => {
  return (dispatch, getState) => {
    dispatch(getUILocales())
  }
}
