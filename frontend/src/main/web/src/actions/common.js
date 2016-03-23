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

export const requestUpdateLocale = (locale) => {
  const endpoint = window.config.baseUrl + window.config.apiRoot + '/language'
  let headers = {
    'Accept': 'application/json'
  }
  if (window.config.auth) {
    headers['x-auth-token'] = window.config.auth.token
    headers['x-auth-user'] = window.config.auth.user
  }
  let formData = new FormData()
  formData.append('locale', locale)
  return {
    [CALL_API]: {
      endpoint,
      method: 'POST',
      headers: headers,
      body: formData,
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

export const updateLocale = (locale) => {
  return (dispatch, getState) => {
    dispatch(updateUILocale(locale)).then(
      dispatch(requestUpdateLocale(locale)))
  }
}
