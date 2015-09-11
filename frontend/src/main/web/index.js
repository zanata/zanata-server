import React from 'react';
import Router from 'react-router';
import RootContent from './lib/components/RootContent';
import Views from './lib/constants/Views.js';
import Configs from './lib/constants/Configs';
import StringUtils from './lib/utils/StringUtils';
import css from './index.css'

var mountNode = document.getElementById('main-content'),
  baseUrl = mountNode.getAttribute('base-url'),
  view = Views.getView(mountNode.getAttribute('view')),
  username = mountNode.getAttribute('username'),
  dev = mountNode.getAttribute('dev');

// base rest url, e.g http://localhost:8080/rest
Configs.baseUrl = baseUrl;
//append with .json extension in 'dev' environment
Configs.urlPostfix = dev === null ? '' : '.json?';
Configs.username = username;

var routes = Views.getRoutes(view);

Router.run(routes, Router.HashLocation, (RootContent) => {
  React.render(<RootContent/>, mountNode);
});

