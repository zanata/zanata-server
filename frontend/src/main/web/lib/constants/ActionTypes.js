import keymirror from 'keymirror';

var UserMatrixActionTypes = keymirror({
  DATE_RANGE_UPDATE: null,
  CONTENT_STATE_UPDATE: null,
  DAY_SELECTED: null
});

var GlossaryActionTypes = keymirror({
  LOCALE_SELECTED: null,
  INSERT_GLOSSARY: null,
  UPDATE_GLOSSARY: null,
  DELETE_GLOSSARY: null
});

exports.UserMatrixActionTypes = UserMatrixActionTypes;
exports.GlossaryActionTypes = GlossaryActionTypes;
