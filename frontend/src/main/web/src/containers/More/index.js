import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import {
  Page,
  ScrollView,
  Flex,
  Link,
  Icon,
  Row,
  Select,
  ButtonLink
} from '../../components'
import {
  updateLocale
} from '../../actions/common'

const classes = {
  list: {
    fz: 'Fz(ms1)--md',
    m: 'My(r2) Mx(a)',
    maw: 'Maw(20em)',
    w: 'W(100%)'
  }
}

class More extends Component {
  render () {
    const {
      handleLocaleChange,
      selectedLocale,
      loading,
      locales
    } = this.props
    const buildInfo = window.config.buildInfo
    const copyrightYears = '© 2008-' + new Date().getFullYear()
    return (
      <Page>
        <Helmet title='More'/>
        <ScrollView theme={{base: {ai: 'Ai(c)'}}}>
          <Flex dir='c' atomic={classes.list}>
            <ul className='W(100%)'>
              <li className='Py(rq) Bdb(bd1) Bdc(light)'>
                <Link useHref
                  target='_blank'
                  link={window.config.links.helpUrl}>
                  Help
                </Link>
              </li>
              <li className='Py(rq) Bdb(bd1) Bdc(light)'>
                <Link useHref
                  target='_blank'
                  link={window.config.links.termsUrl}>
                  Terms
                </Link>
              </li>
              <li className='Py(rq) Bdb(bd1) Bdc(light)'>
                <Link useHref
                  target='_blank'
                  link='http://zanata.org/about'>
                  About
                </Link>
              </li>
              <li className='Py(rq) Bdb(bd1) Bdc(light)'>
                <Link useHref
                  target='_blank'
                  link='http://zanata.org/issues'>
                  Report an issue
                </Link>
              </li>
              <li className='Py(rq)'>
                <ButtonLink type='default'>
                  <Row>
                    <Icon name='mail' atomic={{m: 'Mend(rq)'}}/>
                    <span className='Hidden--lesm'>Contact admin</span>
                  </Row>
                </ButtonLink>
              </li>
              <li className='Pt(r1)'>
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
              <li className='Pt(r1) Fz(msn1) C(muted)'>
                Zanata {buildInfo.version} ({buildInfo.buildTimestamp}) [{buildInfo.scmDescribe}]<br />
                {copyrightYears} <Link useHref={true} link='http://www.redhat.com/'>Red Hat, Inc</Link>
              </li>
            </ul>
            <span>
            </span>
          </Flex>
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
