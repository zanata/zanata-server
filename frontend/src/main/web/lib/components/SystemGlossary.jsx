import React from 'react';
import Configs from '../constants/Configs';
import GlossaryStore from '../stores/GlossaryStore';
import DropDown from './DropDown';
import {PureRenderMixin} from 'react/addons';
import Actions from '../actions/GlossaryActions';
import GlossaryDataTable from './GlossaryDataTable'


var SystemGlossary = React.createClass({
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
    var contents;

    if(this.state.glossary && _.size(this.state.glossary) > 0) {
      contents = (
          <GlossaryDataTable
            localeOptions={this.state.localeOptions}
            glossaryData={this.state.glossary}
            isGlossaryAdmin={false}
            isGlossarist={true}
            isAuthenticated={Configs.authenticated}
            user={Configs.user}
            selectedSrcLocale={this.state.selectedSrcLocale}
            selectedTransLocale={this.state.selectedTransLocale}/>
        );
    } else {
      contents = (<div>No glossary</div>)
    }

    return (<div id="glossaries l--push-bottom-1">
                <div className="txt--lead l--push-bottom-half">
                  <span className="txt--highlight">System Glossary</span>
                  <i className="i i--arrow-right l--push-h-quarter"></i>
                  <DropDown options={this.state.localeOptions} selectedOption={this.state.selectedTransLocale} onClick={Actions.changeTransLocale} />
                  <a href="#" data-toggle="modal" data-target="#glossaryUploadDialog" className="l--float-right">
                    <i className="i i--import i__item__icon"></i> Import Glossary
                  </a>
                </div>
                <div className="g l--push-bottom-half">
                  <div className="g__item w--1-3"><input type="text" placeholder="Search Glossary"></input></div>
                  <div className="g__item w--2-3 txt--align-right">
                    <label className="txt--align-right epsilon">{this.state.glossary.length}</label>
                  </div>
                </div>

                <DropDown options={this.state.localeOptions} selectedOption={this.state.selectedSrcLocale} onClick={Actions.changeSrcLocale} />
                {contents}
            </div>);
  }
});

export default SystemGlossary;
