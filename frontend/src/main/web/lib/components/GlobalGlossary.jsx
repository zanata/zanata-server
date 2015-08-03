import React from 'react';
import Configs from '../constants/Configs';
import GlossaryStore from '../stores/GlossaryStore';
import DropDown from './DropDown';
import Actions from '../actions/GlossaryActions';

var GlobalGlossary = React.createClass({

  getLocaleStats: function() {
    return GlossaryStore.getLocaleStats();
  },

  getInitialState: function() {
    return this.getLocaleStats();
  },

  componentDidMount: function() {
    GlossaryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    GlossaryStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this.getLocaleStats());
  },

  render: function() {
    var authenticated = Configs.authenticated,
      user = Configs.user;

    return (
      <div className="g">
        <div id="glossaries" className="l__wrapper">
          <h1>Glossary</h1>
          <div className="g--centered">
            <div className="g__item l--constrain-medium">
              <DropDown options={this.state.localeOptions} selectedOption={this.state.selectedLocale} onClick={Actions.changeGlossaryLocale} />
            </div>
          </div>
        </div>
      </div>);
  }
});

export default GlobalGlossary;
