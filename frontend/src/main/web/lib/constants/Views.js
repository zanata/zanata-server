import React from 'react';
import Router from 'react-router';
import StringUtils from '../utils/StringUtils';
import RootContent from '../components/RootContent';
import UserProfile from '../components/UserProfile';
import GlobalGlossary from '../components/GlobalGlossary';

var Views = {
  USER_PROFILE: 0,
  GLOSSARY: 1,

  getView: function(value) {
    if(StringUtils.isEmptyOrNull(value)) {
      return null;
    }

    switch (value.toLowerCase()) {
      case 'profile':
      case 'user_profile':
      case 'userProfile':
        return this.USER_PROFILE; break;
      case 'glossary': return this.GLOSSARY; break;
      default: return null; break;
    }
  },

  getRoutes: function(view) {
    var Route = Router.Route,
      DefaultRoute = Router.DefaultRoute,
      NotFoundRoute = Router.NotFoundRoute;

    if(StringUtils.isEmptyOrNull(view)) {
      //request from index.html (dev)
      return (
        <Route handler={RootContent}>
          <Route path="glossary" handler={GlobalGlossary}/>
          <Route path="profile" handler={UserProfile}/>
          <DefaultRoute handler={UserProfile}/>
          <NotFoundRoute handler={RootContent} />
        </Route>
      );
    } else {
      //request from jsf (prod)
      switch (view) {
        case Views.USER_PROFILE:
          return (
            <Route handler={RootContent}>
              <DefaultRoute handler={UserProfile}/>
              <NotFoundRoute handler={RootContent} />
            </Route>
          );
          break;
        case Views.GLOSSARY:
          return (
            <Route handler={RootContent}>
              <DefaultRoute handler={GlobalGlossary}/>
              <NotFoundRoute handler={RootContent} />
            </Route>
          );
          break;
        default :
          return (
            <Route handler={RootContent}>
              <DefaultRoute handler={RootContent}/>
              <NotFoundRoute handler={RootContent} />
            </Route>
          );
          break;
      }
    }
  }
};

export default Views;
