/**
 * Configuration values specific to the development build.
 */

 // There is a getServiceUrl function that handles
 // getting the right base path, which is then used
 // for things like the link to dashboard.
 //
 // It returns a hard-coded value for development
 // (NODE_ENV) and cuts up the URL for production mode.
 //
 // It looks for '/app/' in there and cuts off everything
 // from there onwards to get the service URL.
 // (also strips trailing slash).

 // Plan:
 //  - specify the string to look for in the string (local path)
 //     (PROD: /project/ since that's the only consistent bit)
 //  - specify the local part to add for the resources location
 //     (e.g. /app/) - prefix the script+styles with this
 //  - specify the rest URL
 //     (function, given serviceUrl, returns full path)
 //     (so that it can override the full path sometimes)

/**
 * The path that the zanata server is deployed to.
 *
 * Used as the base URL for REST requests and links to other parts
 * of zanata.
 */
export const SERVICE_URL = 'http://localhost:8080/zanata'

/**
 * Where to find scripts and styles.
 *
 * Empty means it will look in the same path as index.html.
 */
export const RESOURCE_LOCATION = ''
