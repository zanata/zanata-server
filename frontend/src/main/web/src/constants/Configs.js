/**
 * Object for Configuration.
 * See index.js for when data is rendered from html.
 */
var Configs = {
  API_ROOT: null, // base url for rest api
  user: null, // see org.zanata.rest.editor.dto.User
  data: null, // json object of data
  urlPostfix: '',
  // TODO: set auth to null
  auth: {
    'token': 'b1f997395af864968fce5b62abdc340f',
    'user': 'admin'
  }
}

export default Configs
