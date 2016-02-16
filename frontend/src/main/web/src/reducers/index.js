import { combineReducers } from 'redux'
import { routeReducer as routing } from 'react-router-redux'
import glossary from './glossary'

const rootReducer = combineReducers({
  routing,
  glossary
})

export default rootReducer
