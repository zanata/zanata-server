import { handleActions } from 'redux-actions'
import {
  UPDATE_LOCALE_REQUEST,
  UPDATE_LOCALE_SUCCESS,
  UPDATE_LOCALE_FAILURE,
  UPDATE_UI_LOCALE,
  GET_LOCALE_LIST_REQUEST,
  GET_LOCALE_LIST_SUCCESS,
  GET_LOCALE_LIST_FAILURE,
  CLEAR_MESSAGE,
  SEVERITY,
  DEFAULT_LOCALE
} from '../actions/common'

export default handleActions({
  [CLEAR_MESSAGE]: (state, action) => {
    return {
      ...state,
      notification: null
    }
  },
  [UPDATE_UI_LOCALE]: (state, action) => {
    return {
      ...state,
      selectedLocale: action.payload
    }
  },
  [UPDATE_LOCALE_REQUEST]: (state, action) => {
    if (action.error) {
      return {
        ...state,
        loading: false,
        notification: {
          severity: SEVERITY.ERROR,
          message:
          'We were unable to update to selected language. ' +
          'Please refresh this page and try again.'
        }
      }
    }
    return {
      ...state,
      loading: true
    }
  },
  [UPDATE_LOCALE_SUCCESS]: (state, action) => ({
    ...state,
    loading: false
  }),
  [UPDATE_LOCALE_FAILURE]: (state, action) => ({
    ...state,
    loading: false,
    notification: {
      severity: SEVERITY.ERROR,
      message:
      'We were unable to update to selected language. ' +
      'Please refresh this page and try again.'
    }
  }),
  [GET_LOCALE_LIST_REQUEST]: (state, action) => {
    if (action.error) {
      return {
        ...state,
        locales: [{
          'label': DEFAULT_LOCALE.displayName,
          'value': DEFAULT_LOCALE.localeId
        }],
        notification: {
          severity: SEVERITY.ERROR,
          message:
          'We were unable to retrieved list of languages. ' +
          'Please refresh this page and try again.'
        }
      }
    } else {
      return {
        ...state,
        loading: true
      }
    }
  },
  [GET_LOCALE_LIST_SUCCESS]: (state, action) => {
    return {
      ...state,
      loading: false,
      locales: action.payload.map(result => ({
        value: result.localeId,
        label: result.name
      }))
    }
  },
  [GET_LOCALE_LIST_FAILURE]: (state, action) => ({
    ...state,
    locales: [{
      'label': DEFAULT_LOCALE.displayName,
      'value': DEFAULT_LOCALE.localeId
    }],
    notification: {
      severity: SEVERITY.ERROR,
      message:
      'We were unable to retrieved list of languages. ' +
      'Please refresh this page and try again.'
    }
  })
}, {
  locales: [],
  loading: false,
  selectedLocale: DEFAULT_LOCALE.localeId
})
