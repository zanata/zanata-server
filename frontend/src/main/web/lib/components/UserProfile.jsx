import React from 'react';
import RecentContributions from './RecentContributions';
import Configs from '../constants/Configs';

var UserProfile = React.createClass({

  render: function() {
    var authenticated = Configs.authenticated,
      user = Configs.user,
      recentContribution = (<div></div>);

    if(authenticated) {
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
            <img src={user.imageUrl}
              alt={user.username}/>
          </div>
          <div className="media__body">
            <h1 id="profile-displayname"
              className="l--push-all-0">{user.name}</h1>
            <ul className="list--no-bullets txt--meta">
              <li id="profile-username">
                <i className="i i--user list__icon"
                  title="Username"></i>
                  {user.username}
              </li>
              <li id="profile-languages">
                <i className="i i--language list__icon"
                  title="Spoken languages"></i>
                {user.languageTeams}
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
