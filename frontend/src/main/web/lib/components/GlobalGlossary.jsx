import React from 'react';
import Configs from '../constants/Configs';
import GlossaryStore from '../stores/GlossaryStore';
import DropDown from './DropDown';
import {PureRenderMixin} from 'react/addons';
import Actions from '../actions/GlossaryActions';
import GlossaryHelper from '../utils/GlossaryHelper';
import GlossaryDataTable from './GlossaryDataTable'


var GlobalGlossary = React.createClass({
  mixins: [PureRenderMixin],

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
    var contents,
      transLocale = GlossaryHelper.getLocaleIdByDisplayName(this.state.transLocales, this.state.selectedTransLocale),
      srcLocale = GlossaryHelper.getLocaleIdByDisplayName(this.state.srcLocales, this.state.selectedSrcLocale);

    if(this.state.glossary && this.state.glossary.length > 0) {
      contents = (
          <GlossaryDataTable
            glossaryData={this.state.glossary}
            isGlossaryAdmin={true}
            isGlossarist={true}
            isAuthenticated={Configs.authenticated}
            user={Configs.user}
            selectedSrcLocale={srcLocale}
            selectedTransLocale={transLocale}/>
        );
    } else {
      contents = (<div>No glossary</div>)
    }

    return (<div id="glossaries" className="g--centered">
              <div className="g__item w--2-3">
                <h1>Glossary</h1>
                <DropDown options={this.state.srcLocaleOptions} selectedOption={this.state.selectedSrcLocale} onClick={Actions.changeSrcLocale} />
                <DropDown options={this.state.transLocaleOptions} selectedOption={this.state.selectedTransLocale} onClick={Actions.changeTransLocale} />
                {contents}
              </div>
            </div>);
  }
});

export default GlobalGlossary;
