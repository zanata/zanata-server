import { combineReducers } from 'redux'
import { routeReducer as routing } from 'react-router-redux'
import glossary from './glossary'
import explore from './explore'

const rootReducer = combineReducers({
  routing,
  explore,
  glossary
})

export default rootReducer
