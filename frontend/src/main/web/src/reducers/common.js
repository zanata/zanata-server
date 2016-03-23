import { handleActions } from 'redux-actions'
import {
  UPDATE_LOCALE_REQUEST,
  UPDATE_LOCALE_SUCCESS,
  UPDATE_LOCALE_FAILURE,
  UPDATE_UI_LOCALE,
  CLEAR_MESSAGE,
  SEVERITY
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
  })
}, {
  locales: [],
  loading: false,
  selectedLocale: 'en-US'
})
