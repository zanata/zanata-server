import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Router from 'react-router'
import RootContent from './components/RootContent'
import Views from './constants/Views.js'
import Configs from './constants/Configs'
import { isUndefined } from 'lodash'
import 'zanata-ui/lib/styles/index.css'
import './styles/atomic.css'

/**
 * Process attributes in dom element:id='main-content'
 *
 * base-url - base url for rest api
 * user - json object of user information. See {@link org.zanata.rest.editor.dto.User}
 * data - json object of any information to be included. e.g Permission {@link org.zanata.rest.editor.dto.Permission}, and View
 * dev - If 'dev' attribute exist, all api data will be retrieve from .json file in test directory.
 */
var mountNode = document.getElementById('main-content')
var baseUrl = mountNode.getAttribute('base-url')
var user = JSON.parse(mountNode.getAttribute('user'))
var data = JSON.parse(mountNode.getAttribute('data'))
var view = Views.getView(data.view)
var dev = data.dev

// base rest url, e.g http://localhost:8080/rest
Configs.baseUrl = baseUrl;
Configs.data = data;
//append with .json extension in 'dev' environment
Configs.urlPostfix = isUndefined(dev) ? '' : '.json?';
// see org.zanata.rest.editor.dto.User
Configs.user = user;

/**
 * Use react-router to process which view to display.
 * Current implementation uses jsf to wrap react page for security reason.
 */
var routes = Views.getRoutes(view, !isUndefined(dev));

Router.run(routes, Router.HashLocation, (RootContent) => {
  ReactDOM.render(<RootContent/>, mountNode)
});
