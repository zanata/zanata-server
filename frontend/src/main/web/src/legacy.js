/*
 * Copyright 2016, Red Hat, Inc. and individual contributors as indicated by the
 * @author tags. See the copyright.txt file in the distribution for a full
 * listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */

import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { isUndefined } from 'lodash'
import { Icons } from 'zanata-ui'
import createLogger from 'redux-logger'
import WebFont from 'webfontloader'
import Nav from './components/Nav'
import Configs from './constants/Configs'
import 'zanata-ui/lib/styles/index.css'
import './styles/base.css'
import './styles/atomic.css'
import './styles/extras.css'

WebFont.load({
  google: {
    families: [
      'Source Sans Pro:200,400,600',
      'Source Code Pro:400,600'
    ]
  },
  timeout: 2000
})

/**
 * Process attributes in dom element:id='main-content'
 *
 * base-url - base url for rest api
 * user - json object of user information.
 * See {@link org.zanata.rest.editor.dto.User}
 * data - json object of any information to be included.
 * e.g Permission {@link org.zanata.rest.editor.dto.Permission}, and View
 * dev - If 'dev' attribute exist, all api data will be retrieve
 * from .json file in test directory.
 */
var mountNode = document.getElementById('root')
var user = JSON.parse(mountNode.getAttribute('user'))
var data = JSON.parse(mountNode.getAttribute('data'))
var dev = data.dev

// Replace with redux state
// base rest url, e.g http://localhost:8080/rest
Configs.API_ROOT = mountNode.getAttribute('base-url')
Configs.data = data
// append with .json extension in 'dev' environment
Configs.urlPostfix = isUndefined(dev) ? '' : '.json?'
// see org.zanata.rest.editor.dto.User
Configs.user = user

let links = {
  'context': Configs.API_ROOT,
  '/login': Configs.data.loginUrl,
  '/help': Configs.data.helpUrl,
  '/terms': Configs.data.termsUrl,
  '/signup': Configs.data.registerUrl,
  '/logout': Configs.data.logoutUrl
}

let activePath = window.location.pathname;

render(
  <div className='H(100%)'>
    <Icons />
    <Nav active={activePath} legacy links={links}/>
  </div>
  ,
  document.getElementById('root')
)
