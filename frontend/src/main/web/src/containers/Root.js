import React, { Component, PropTypes } from 'react' // eslint-disable-line
import { Provider } from 'react-redux'
import { Router, Route, Redirect, IndexRedirect } from 'react-router'
import App from '../containers/App'
import Glossary from '../containers/Glossary'
import UserProfile from '../containers/UserProfile'
import View from '../components/View'
import {
  glossaryInitialLoad
} from '../actions/glossary.js'

export default class Root extends Component {
  render () {
    const username = window.config.user.username
    const {
      store,
      history
    } = this.props
    return (
      <Provider store={store}>
        <View>
          <Router history={history}>
            <Route component={App} >
              <Route path="glossary" component={Glossary}
                onEnter={() => store.dispatch(glossaryInitialLoad())} />
              <Route path="profile/:username" component={UserProfile} />
              <Redirect from="profile" to={`profile/${username}`} />
              <Redirect from="/" to={`profile/${username}`} />
            </Route>
          </Router>
        </View>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}
