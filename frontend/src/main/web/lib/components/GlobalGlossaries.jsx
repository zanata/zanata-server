import React from 'react';
import Configs from '../constants/Configs';

var UserProfile = React.createClass({

  render: function() {
    var authenticated = Configs.authenticated,
      user = Configs.user;

    return (
      <div className="g">
        <div id="glossaries" className="g__item w--1-4 w--1-2-m">
          Glossary
        </div>
      </div>);
  }
});

export default UserProfile;
