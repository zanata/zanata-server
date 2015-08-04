import Dispatcher from '../dispatchers/GlossaryDispatcher';
import {GlossaryActionTypes} from '../constants/ActionTypes';


var Actions = {
  changeGlossaryLocale: function(selectedLocale) {
    Dispatcher.handleViewAction({
      actionType: GlossaryActionTypes.LOCALE_SELECTED,
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
   }
};

export default Actions;
