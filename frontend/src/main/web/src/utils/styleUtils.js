import { merge, values } from 'lodash'
import flattenObj from 'flat'

export const flattenThemeClasses = (base, ...otherClasses) => {
  return values(
    flattenObj(merge({}, base, ...otherClasses))
  ).join(' ').trim()
}
