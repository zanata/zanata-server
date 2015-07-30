import _ from 'lodash';

var StringUtils = {
  isEmptyOrNull: function (str) {
    return _.isUndefined(str) || _.isNull(str) || !str || 0 === str.length;
  },

  isEqualIgnoreCase: function (str1, str2) {
    if(this.isEmptyOrNull(str1) || this.isEmptyOrNull(str2)) {
      return false;
    }
    return str1.toLowerCase() === str2.toLowerCase();
  }
};
export default StringUtils;
