import StringUtils from '../utils/StringUtils';

var Views = {
  USER_PROFILE: 0,
  GLOSSARY: 1,
  HOME: 2,

  getView: function(value) {
    if(StringUtils.isEmptyOrNull(value)) {
      return this.HOME;
    }

    switch (value.toLowerCase()) {
      case 'profile':
      case 'user_profile':
      case 'userProfile':
        return this.USER_PROFILE; break;
      case 'glossary': return this.GLOSSARY; break;
      default: return this.HOME; break;
    }

  }
};

export default Views;