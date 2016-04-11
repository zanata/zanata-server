import { createAction } from 'redux-actions'
import { CALL_API } from 'redux-api-middleware'

export const CLEAR_MESSAGE = 'CLEAR_MESSAGE'
export const clearMessage = createAction(CLEAR_MESSAGE)

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

export const buildAPIRequest = (endpoint, method, headers, types, body) => {
  return body
    ? {
      endpoint,
      method: method,
      headers: headers,
      credentials: 'include',
      body: body,
      types: types
    }
    : {
      endpoint,
      method: method,
      headers: headers,
      credentials: 'include',
      types: types
    }
}
