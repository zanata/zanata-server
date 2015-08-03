import Dispatcher from '../dispatchers/GlossaryDispatcher';
import {GlossaryActionTypes} from '../constants/ActionTypes';


var Actions = {
  changeGlossaryLocale: function(selectedLocale) {
    Dispatcher.handleViewAction(
      {
        actionType: GlossaryActionTypes.LOCALE_SELECTED,
        data: selectedLocale
      }
    );
  },
};

export default Actions;
