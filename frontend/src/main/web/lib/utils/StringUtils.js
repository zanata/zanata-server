import _ from 'lodash';

var StringUtils = {
  isEmptyOrNull: function (str) {
    return _.isUndefined(str) || _.isNull(str) || 0 === str.length;
  },

  trimLeadingSpace: function (str) {
    if(this.isEmptyOrNull(str)) {
      return str;
    }
    while (str.substring(0,1) == ' ') {
      str = str.substring(1, str.length);
    }
    return str;
  },

  trim: function (str) {
    return this.isEmptyOrNull(str) ? str : str.trim();
  }
};
export default StringUtils;
