import React from 'react';
import Configs from '../constants/Configs';

var UserProfile = React.createClass({

  render: function() {

    /**
     *
     * - Get list of locales-count from available glossary -  /rest/glossary/locales/list
     * - Get all glossary from single locales - /rest/glossary/localeId
     *
     * - insert/update glossary - /rest/glossary/GlossaryDTO - NEW need to update glossaryserviceimpl to detect
     *
     * - delete all glossary in locale - /rest/glossary/locale
     * - delete glossary - /rest/glossary/id NEW
     */


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
