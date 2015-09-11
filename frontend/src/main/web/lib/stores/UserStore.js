import {Promise} from 'es6-promise';
import Request from 'superagent';
import Configs from '../constants/Configs';
import _ from 'lodash';

function getUserInfoUrl() {
  return Configs.baseUrl + "/user/" + Configs.username + Configs.urlPostfix
}

function getUserInfo() {
  var url = getUserInfoUrl();
  return new Promise(function(resolve, reject) {
    Request.get(url)
      .set("Cache-Control", "no-cache, no-store, must-revalidate")
      .set('Accept', 'application/json')
      .set("Pragma", "no-cache")
      .set("Expires", 0)
      .end((function (err, res) {
        if(res != null) {
          if (res.error) {
            console.error(url, res.status, res.error.toString());
          }
          resolve(res['body']);
        } else {
          resolve(null);
        }
      }));
  });
}

//see org.zanata.rest.editor.dto.User
function processUserInfo(serverResponse) {
  if(serverResponse === null) {
    return  {
      authenticated: false
    }
  } else {
    serverResponse['authenticated'] = true;
    return serverResponse
  }
}

var UserStore = {
  getUserInfo: function () {
      return getUserInfo().then(processUserInfo);
  }
};

export default UserStore