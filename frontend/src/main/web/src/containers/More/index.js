import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import {
  Page,
  ScrollView,
  View,
  Link,
  Icon,
  Row,
  Select,
  ButtonLink
} from '../../components'
import {
  updateLocale
} from '../../actions/common'

class More extends Component {
  render () {
    const {
      handleLocaleChange,
      selectedLocale,
      loading
      } = this.props

    const locales = [
      {
        'label': 'Chinese (Simplified)',
        'value': 'zh-Hans'
      },
      {
        'label': 'English',
        'value': 'en-US'
      }
    ]

    const buildInfo = window.config.buildInfo
    const copyrightYears = '© 2008-' + new Date().getFullYear()
    return (
      <Page>
        <Helmet title='More'/>
        <ScrollView theme={{base: {ai: 'Ai(c)'}}}>
          <View>
            <ul>
              <li>
                <Link useHref={true} link={window.config.links.helpUrl}>Help</Link>
              </li>
              <li>
                <Link useHref={true} link={window.config.links.termsUrl}>Terms</Link>
              </li>
              <li>
                <Link useHref={true} link='http://zanata.org/about'>About</Link>
              </li>
              <li>
                <ButtonLink type='default'>
                  <Row>
                    <Icon name='mail' atomic={{m: 'Mend(rq)'}}/>
                    <span className='Hidden--lesm'>Contact admin</span>
                  </Row>
                </ButtonLink>
              </li>
              <li>
                <Select
                  name='locale-selection'
                  placeholder={'Select a language…'}
                  className='Flx(flx1)'
                  value={selectedLocale}
                  options={locales}
                  isLoading={loading}
                  onChange={handleLocaleChange}
                />
              </li>
              <li>
                Version: {buildInfo.version} <br/>
                Build timestamp: {buildInfo.buildTimestamp}<br/>
                Scm: {buildInfo.scmDescribe}<br/>
                Copyright notice: {copyrightYears} <Link useHref={true} link='http://www.redhat.com/'>Red Hat, Inc</Link>
              </li>
            </ul>
            <span>
            </span>
          </View>
        </ScrollView>
      </Page>
    )
  }
}

const mapStateToProps = (state) => {
  const {
    locales,
    selectedLocale,
    loading
    } = state.common
  return {
    locales,
    selectedLocale,
    loading
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    handleLocaleChange: (locale) => {
      dispatch(updateLocale(locale.value))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(More)
