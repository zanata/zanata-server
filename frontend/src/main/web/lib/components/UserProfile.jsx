import React from 'react';
import RecentContributions from './RecentContributions';

var UserProfile = React.createClass({
  propTypes: {
    authenticated: React.PropTypes.bool.isRequired,
    user: React.PropTypes.shape(
      {
        username: React.PropTypes.string.isRequired,
        email: React.PropTypes.string.isRequired,
        name: React.PropTypes.string.isRequired,
        imageUrl: React.PropTypes.string.isRequired,
        languageTeams: React.PropTypes.string.isRequired
      }).isRequired
  },

  render: function() {
    var recentContribution = (<div></div>);

    if(this.props.authenticated) {
      recentContribution =
        (<div className="g__item w--3-4 w--1-2-m">
          <div className="bg--pop-highest l--pad-v-1">
            <RecentContributions/>
          </div>
        </div>);
    }

    return (<div className="g">
      <div id="profile-overview" className="g__item w--1-4 w--1-2-m">
        <div className="media l--push-bottom-half">
          <div className="media__item--right bx--round">
            <img src={this.props.user.imageUrl}
              alt={this.props.user.username}/>
          </div>
          <div className="media__body">
            <h1 id="profile-displayname"
              className="l--push-all-0">{this.props.user.name}</h1>
            <ul className="list--no-bullets txt--meta">
              <li id="profile-username">
                <i className="i i--user list__icon"
                  title="Username"></i>
                  {this.props.user.username}
              </li>
              <li id="profile-languages">
                <i className="i i--language list__icon"
                  title="Spoken languages"></i>
                {this.props.user.languageTeams}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- user contribution matrix -->
      {recentContribution}
    </div>);
  }
});

export default UserProfile;