import React, { Component } from 'react'
// import a11y from 'react-a11y'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import {
  Nav,
  View,
  Icons
} from '../components'

// if (process.env.NODE_ENV === 'development') a11y(React)

class App extends Component {
  constructor (props) {
    super(props)
  }
  render () {
    const theme = {
      base: {
        h: 'H(100vh)',
        fld: 'Fld(c) Fld(r)--sm'
      }
    }
    const {
      children,
      activePath,
      ...props
    } = this.props

    const links = {
      'context': config.baseUrl,
      '/login': config.links.loginUrl,
      '/help': config.links.helpUrl,
      '/terms': config.links.termsUrl,
      '/signup': config.links.registerUrl,
      '/logout': config.links.logoutUrl
    }

    return (
      <View {...props} theme={theme}>
        <Icons />
        <Helmet
          title="Zanata"
          titleTemplate="%s | Zanata"
        />
        <Nav active={activePath} links={links} />
        {children}
      </View>
    )
  }
}

function mapStateToProps (state) {
  return {
    activePath: state.routing.location.pathname
  }
}

export default connect(mapStateToProps)(App)
