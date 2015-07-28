import React from 'react';
import RootContent from './lib/components/RootContent';
import Views from './lib/constants/Views.js';
import Configs from './lib/constants/Configs';

var mountNode = document.getElementById('main-content'),
  baseUrl = mountNode.getAttribute('base-url'),
  user = JSON.parse(mountNode.getAttribute('user')),
  view = mountNode.getAttribute('view'),
  authenticated = mountNode.getAttribute('authenticated') === 'true';

Configs.baseUrl = baseUrl;
// see org.zanata.rest.editor.dto.User
Configs.user = user;
//boolean
Configs.authenticated = authenticated;
//TODO: currently its passed from xhtml on view,
// final solution should be using react-router + processing url
Configs.view = Views.getView(view);
//dev environment uses local data store, if its invalid url, use test data
Configs.production = ValidUrl(baseUrl);

if(!Configs.production) {
  console.warn("Invalid base url, running on test data", baseUrl);
}


function ValidUrl(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !pattern.test(str);
}

React.render(<RootContent />, mountNode);
