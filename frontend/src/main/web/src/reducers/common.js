import { handleActions } from 'redux-actions'
import {
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
  }
}, {
  locales: [],
  loading: false,
  selectedLocale: DEFAULT_LOCALE.localeId
})
