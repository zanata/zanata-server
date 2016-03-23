import React from 'react'
import Helmet from 'react-helmet'
import RecentContributions from './RecentContributions'
import UserMatrixStore from '../../stores/UserMatrixStore'
import { isEmpty } from 'lodash'
import {
  Page,
  ScrollView,
  View,
  Notification,
  LoaderText}
from '../../components'

var UserProfile = React.createClass({
  getMatrixState: function () {
    const username = this.props.params.username
      ? this.props.params.username
      : window.config.user.username
    return UserMatrixStore.getMatrixState(username)
  },

  getInitialState: function () {
    return this.getMatrixState()
  },

  componentDidMount: function () {
    UserMatrixStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function () {
    UserMatrixStore.removeChangeListener(this._onChange)
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.params.username !== this.props.params.username) {
      this.setState(UserMatrixStore.getMatrixState(nextProps.params.username))
    }
  },

  _onChange: function () {
    this.setState(this.getMatrixState())
  },

  render: function () {
    const user = isEmpty(this.state.user) ? window.config.user : this.state.user
    const username = user && user.username ? user.username : ''
    const languageTeams = user && user.languageTeams
      ? user.languageTeams.join() : ''
    const notification = this.state.notification

    return (
      <Page>
        {notification && (<Notification
          severity={notification.severity}
          message={notification.message}
          details={notification.details}
          show={!!notification} />
        )}
        <Helmet title='User Profile' />
        <ScrollView>
          <View theme={{ base: {p: 'Pt(r6) Pb(r2)'} }}>
            {user.loading
              ? (<LoaderText theme={{ base: { fz: 'Fz(ms1)' } }}
                    size='1' loading/>
                )
              : (<div id='profile-overview' className='g__item w--1-4 w--1-2-m'>
                  <div className='media l--push-bottom-half'>
                    <div className='media__item--right bx--round'>
                      <img src={user && user.imageUrl ? user.imageUrl : ''}
                        alt={username} />
                    </div>
                    <div className='media__body'>
                      <h1 id='profile-displayname' className='l--push-all-0'>
                        {user && user.name ? user.name : ''}
                      </h1>
                      <ul className='list--no-bullets txt--meta'>
                        <li id='profile-username'>
                          <i className='i i--user list__icon' title='Username'></i>
                          {username}&nbsp
                          {user && user.email
                            ? (<span className='txt--meta'>({user.email})</span>)
                            : undefined}
                        </li>
                        {user && user.languageTeams
                          ? (<li id='profile-languages'>
                          <i className='i i--language list__icon'
                            title='Spoken languages'>
                          </i>
                          {languageTeams}
                        </li>)
                          : undefined}
                      </ul>
                    </div>
                  </div>
                </div>)
            }

            {window.config.permission.isLoggedIn &&
              (<div className='g__item w--3-4 w--1-2-m'>
                <div className='bg--pop-highest l--pad-v-1'>
                  <RecentContributions
                    loading={this.state.loading}
                    dateRangeOption={this.state.dateRangeOption}
                    matrixForAllDays={this.state.matrixForAllDays}
                    wordCountsForSelectedDayFilteredByContentState={
                      this.state.wordCountsForSelectedDayFilteredByContentState
                    }
                    wordCountsForEachDayFilteredByContentState={
                      this.state.wordCountsForEachDayFilteredByContentState}
                    contentStateOption={this.state.contentStateOption}
                    selectedDay={this.state.selectedDay}
                    dateRange={this.state.dateRange} />
                </div>
              </div>)
            }
          </View>
        </ScrollView>
      </Page>
    )
  }
})

export default UserProfile
