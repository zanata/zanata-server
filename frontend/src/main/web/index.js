import React from 'react';
import Router from 'react-router';
import RootContent from './lib/components/RootContent';
import Views from './lib/constants/Views.js';
import Configs from './lib/constants/Configs';
import StringUtils from './lib/utils/StringUtils';
import css from './index.css'

var mountNode = document.getElementById('main-content'),
  baseUrl = mountNode.getAttribute('base-url'),
  user = JSON.parse(mountNode.getAttribute('user')),
  view = Views.getView(mountNode.getAttribute('view')),
  authenticated = mountNode.getAttribute('authenticated') === 'true',
  dev = mountNode.getAttribute('dev');

// base rest url, e.g http://localhost:8080/rest
Configs.baseUrl = baseUrl;
// see org.zanata.rest.editor.dto.User
Configs.user = user;
//is user authenticated
Configs.authenticated = authenticated;
//append with .json extension in 'dev' environment
Configs.urlPostfix = dev === null ? '' : '.json?';

var routes = Views.getRoutes(view);

Router.run(routes, Router.HashLocation, (RootContent) => {
  React.render(<RootContent/>, mountNode);
});

