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
      user = Configs.user, rows = [];

    _.forOwn(this.state.glossary.glossaryEntries, function (glossaryEntry) {
      var str = toString(glossaryEntry);
      rows.push(<li>{str}</li>)
    });

    return (
      <div className="g">
        <div id="glossaries" className="l__wrapper">
          <h1>Glossary</h1>
          <div className="g--centered">
            <div className="g__item l--constrain-medium">
              <DropDown options={this.state.localeOptions} selectedOption={this.state.selectedLocale} onClick={Actions.changeGlossaryLocale} />
              <ul>
              {rows}
              </ul>
            </div>
          </div>
        </div>
      </div>);
  }
});

function toString(entry) {
  console.info(entry);
  var termStr = "";

  _.forOwn(entry.glossaryTerms, function (term) {
    termStr += " resId:" + term.resId + ", content:" + term.content + ", locale:" + term.locale + ", comments:" + term.comments;
  });
  return "srcLang:" + entry.srcLang + ", srcRef:" + entry.sourceReference + ", terms:[" + termStr + "]";
}

export default GlobalGlossary;
