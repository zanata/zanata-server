import Dispatcher from '../dispatchers/GlossaryDispatcher';
import {GlossaryActionTypes} from '../constants/ActionTypes';


var Actions = {
  changeSrcLocale: function(selectedLocale) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.SRC_LOCALE_SELECTED,
      data: selectedLocale
    });
  },
  changeTransLocale: function(selectedLocale) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.TRANS_LOCALE_SELECTED,
      data: selectedLocale
    });
  },
  createGlossary: function(glossary) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.INSERT_GLOSSARY,
      data: glossary
    });
  },
  updateGlossary: function(glossary) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.UPDATE_GLOSSARY,
      data: glossary
    });
  },
  deleteGlossary: function(resId, srcLocaleId) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.DELETE_GLOSSARY,
      data: {
       resId: resId,
       srcLocale: srcLocaleId
      }
    });
  },
  resetGlossaryEntry: function(resId) {
    Dispatcher.handleViewAction({
        actionType: GlossaryActionTypes.RESET_GLOSSARY_ENTRY,
        data: {
         resId: resId
        }
    });
  }
};

export default Actions;
