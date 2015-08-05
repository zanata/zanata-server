import React from 'react';
import Configs from '../constants/Configs';
import GlossaryStore from '../stores/GlossaryStore';
import DropDown from './DropDown';
import Actions from '../actions/GlossaryActions';

var GlobalGlossary = React.createClass({

  getLocaleStats: function() {
    return GlossaryStore.init();
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
      user = Configs.user, contents, rows = [];

    if(this.state.localeOptions.length > 0) {
      _.forOwn(this.state.glossary.glossaryEntries, function (glossaryEntry) {
        var str = toString(glossaryEntry);
        rows.push(<li>{str}</li>)
      });

      contents = (
        <div className="g__item l--constrain-medium">
          <DropDown options={this.state.localeOptions} selectedOption={this.state.selectedLocale} onClick={Actions.changeGlossaryLocale} />
          <ul>{rows}</ul>
        </div>);
    } else {
      contents = (<div>No glossary</div>)
    }


    return (<div id="glossaries" className="g--centered">
              <div className="g__item w--2-3">
                <h1>Glossary</h1>
                {contents}
              </div>
            </div>);
  }
});

function toString(entry) {
  var termStr = "";

  _.forOwn(entry.glossaryTerms, function (term) {
    termStr += " resId:" + term.resId + ", content:" + term.content + ", locale:" + term.locale + ", comments:" + term.comments;
  });
  return "srcLang:" + entry.srcLang + ", srcRef:" + entry.sourceReference + ", terms:[" + termStr + "]";
}

export default GlobalGlossary;
