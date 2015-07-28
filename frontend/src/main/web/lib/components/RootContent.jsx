import React from 'react';
import UserProfile from './UserProfile';
import Configs from '../constants/Configs';
import Views from '../constants/Views';

var RootContent = React.createClass({
  render: function() {
    var child;

    switch (Configs.view) {
      case Views.USER_PROFILE: child = this.getUserProfileView(); break;
      case Views.GLOSSARY: child = this.getGlossaryView(); break;
      default: child = this.getHomeView(); break;
    }
    return (child);
  },

  getUserProfileView: function() {
    return (<UserProfile authenticated={Configs.authenticated} user={Configs.user}/>);
  },

  getGlossaryView: function() {
    return (<div>Glossary</div>);
  },

  getHomeView: function() {
    return (<div/>);
  }
});

export default RootContent;