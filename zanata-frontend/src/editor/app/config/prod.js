/**
 * Configuration values specific to the production build.
 */

// Expected editor part of the pathname, used to figure out
// the base service URL based on the current URL.
const EDITOR_PATH = 'project'

 /**
  * The path that the zanata server is deployed to.
  *
  * Used as the base URL for REST requests and links to other parts
  * of zanata.
  */
export const SERVICE_URL = getServiceUrl()

// TODO update the example docs.
/**
 * @returns Root Zanata url with context path.
 * Url will start from index 0 to index of EDITOR_PATH
 *
 * e.g current url= http://localhost:7878/zanata/app/testurl/test.html
 * returns http://localhost:7878/zanata
 */
function getServiceUrl () {
  var serviceUrl = location.origin + location.pathname
  const index = location.href.indexOf(EDITOR_PATH)
  if (index >= 0) {
    // remove EDITOR_PATH onwards from url
    serviceUrl = location.href.substring(0, index)
  }
  serviceUrl = serviceUrl.replace(/\/?$/, '') // remove trailing slash
  return serviceUrl
}

/**
 * Where to find scripts and styles.
 */
export const RESOURCE_LOCATION = SERVICE_URL + '/app/'
