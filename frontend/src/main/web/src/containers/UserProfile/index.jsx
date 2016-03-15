import React from 'react'
import RecentContributions from './RecentContributions'
import UserMatrixStore from '../../stores/UserMatrixStore'

import {
  LoaderText,
  Page,
  ScrollView,
  View,
  Notification
} from '../../components'

var UserProfile = React.createClass({

  getMatrixState: function () {
    return UserMatrixStore.getMatrixState()
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

  _onChange: function () {
    this.setState(this.getMatrixState())
  },

  render: function () {
    const user = window.config.user
    const username = user && user.username ? user.username : ''
    const languageTeams = user && user.languageTeams
      ? user.languageTeams.join() : ''
    const notification = this.state.notification

    return (
      <Page>
        {notification
          ? (<Notification severity={notification.severity}
          message={notification.message}
          details={notification.details}
          show={notification ? true : false}/>)
          : undefined
        }
        <Helmet title='User Profile'/>
        <ScrollView>
          <ViewHeader />
          <View theme={{ base: {p: 'Pt(r6) Pb(r2)'} }}>
            <div id="profile-overview" className="g__item w--1-4 w--1-2-m">
              <div className="media l--push-bottom-half">
                <div className="media__item--right bx--round">
                  <img src={user && user.imageUrl ? user.imageUrl : ''}
                    alt={username}/>
                </div>
                <div className="media__body">
                  <h1 id="profile-displayname"
                    className="l--push-all-0">{user && user.name ? user.name : ''}</h1>
                  <ul className="list--no-bullets txt--meta">
                    <li id="profile-username">
                      <i className="i i--user list__icon"
                        title="Username"></i>
                      {username}&nbsp;
                      {user && user.email
                        ? (<span className="txt--meta">({user.email})</span>)
                        : undefined
                        }
                    </li>
                    {user && user.languageTeams
                      ? (<li id="profile-languages">
                      <i className="i i--language list__icon" title="Spoken languages"></i>
                      {languageTeams}
                    </li>)
                      : undefined}
                  </ul>
                </div>
              </div>
            </div>
            {window.config.permission.isLoggedIn
              ? (
            <div className="g__item w--3-4 w--1-2-m">
              <div className="bg--pop-highest l--pad-v-1">
                <RecentContributions
                  loading={this.state.loading}
                  dateRangeOption={this.state.dateRangeOption}
                  matrixForAllDays={this.state.matrixForAllDays}
                  wordCountsForSelectedDayFilteredByContentState={this.state.wordCountsForSelectedDayFilteredByContentState}
                  wordCountsForEachDayFilteredByContentState={this.state.wordCountsForEachDayFilteredByContentState}
                  contentStateOption={this.state.contentStateOption}
                  selectedDay={this.state.selectedDay}
                  dateRange={this.state.dateRange}/>
              </div>
            </div>)
              : undefined
              }
          </View>
        </ScrollView>
      </Page>
    )
  }
})

export default UserProfile
