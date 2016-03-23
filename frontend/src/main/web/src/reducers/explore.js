import { handleActions } from 'redux-actions'
import {
  SEARCH_REQUEST,
  SEARCH_SUCCESS,
  SEARCH_FAILURE,
  SEARCH_DEFAULT_RETURNED
} from '../actions/explore'

export default handleActions({
  [SEARCH_REQUEST]: (state, action) => ({
    ...state,
    error: false,
    loading: true
  }),
  [SEARCH_SUCCESS]: (state, action) => ({
    ...state,
    results: action.payload,
    loading: false
  }),
  [SEARCH_FAILURE]: (state, action) => ({
    ...state,
    results: action.payload,
    error: true,
    loading: false
  }),
  [SEARCH_DEFAULT_RETURNED]: (state, action) => ({
    ...state,
    default: action.payload,
    error: false,
    loading: false
  })
}, {
  default: [],
  error: false,
  loading: false,
  results: null
})
