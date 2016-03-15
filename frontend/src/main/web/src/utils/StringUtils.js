import isEmpty from 'lodash/isEmpty'

export function isEmptyOrNull (str) { return isEmpty(str) }
export function trimLeadingSpace (str) {
  return isEmptyOrNull(str) ? str : str.replace(/^\s+/g, '')
}
export function trim (str) {
  return isEmptyOrNull(str) ? str : str.trim()
}

export function isJsonString (str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export default {
  isEmptyOrNull,
  trimLeadingSpace,
  trim,
  isJsonString
}
