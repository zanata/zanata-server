import merge from 'lodash/merge'
import values from 'lodash/values'
import flattenObj from 'flat'

export const mergeClasses = (base, ...otherClasses) => {
  return merge({}, base, ...otherClasses)
}

export const flattenClasses = (base, ...otherClasses) => {
  return values(
    flattenObj(mergeClasses(base, ...otherClasses))
  ).join(' ').trim()
}

const isChromium = window.chrome
const vendorName = window.navigator.vendor
const isOpera = window.navigator.userAgent.indexOf('OPR') > -1
const isIEedge = window.navigator.userAgent.indexOf('Edge') > -1
const isChrome = (isChromium !== null && isChromium !== undefined &&
  vendorName === 'Google Inc.' && isOpera === false && isIEedge === false)

export const canGoBack = ((isChrome && window.history.length > 2) ||
  (!isChrome && window.history.length > 1))
