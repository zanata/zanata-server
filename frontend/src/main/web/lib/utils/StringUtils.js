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
  },

  trimLeadingSpace: function (str) {
    while (str.substring(0,1) == ' ') {
      str = str.substring(1, str.length);
    }
    return str;
  },

  trim: function (str) {
    if(_.isNull(str) || _.isUndefined(str)) {
      return str;
    } else {
      return str.trim();
    }
  }
};
export default StringUtils;
