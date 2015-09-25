import React from 'react';
import Configs from '../constants/Configs';
import GlossaryStore from '../stores/GlossaryStore';
import { PureRenderMixin } from 'react/addons';
import Actions from '../actions/GlossaryActions';
import { Button, Input, Icons, Icon, Select } from 'zanata-ui'
import DataTable from './glossary/DataTable'
import NewEntryModal from './glossary/NewEntryModal'
import ImportModal from './glossary/ImportModal'
import { Loader } from 'zanata-ui'
import _ from 'lodash';
import StringUtils from '../utils/StringUtils'

var SystemGlossary = React.createClass({
  mixins: [PureRenderMixin],

  _init: function() {
    return GlossaryStore.init();
  },

  getInitialState: function() {
    return this._init();
  },

  componentDidMount: function() {
    GlossaryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    GlossaryStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this._init());
  },

  _handleTransChange: function(localeId) {
    Actions.changeTransLocale(localeId)
  },

  _handleFilterKeyDown: function(event) {
    if(event.key == 'Enter') {
      Actions.updateFilter(this.state.filter);
    }
  },

  _handleFilterChange: function(event) {
    this.setState({filter: event.target.value});
  },

  render: function() {
    var count = 0,
      selectedTransLocale = this.state.selectedTransLocale,
      uploadSection = null, newEntrySection = null;

    var contents = (<DataTable
      glossaryData={this.state.glossary}
      glossaryResId={this.state.glossaryResId}
      focusedRow={this.state.focusedRow}
      hoveredRow={this.state.hoveredRow}
      totalCount={this.state.glossaryResId.length}
      canAddNewEntry={this.state.canAddNewEntry}
      canUpdateEntry={this.state.canUpdateEntry}
      user={Configs.user}
      sort={this.state.sort}
      srcLocale={this.state.srcLocale}
      selectedTransLocale={selectedTransLocale}/>);


    if(!_.isUndefined(this.props.srcLocale) && !_.isNull(this.props.srcLocale)) {
      count = this.state.srcLocale.numberOfTerms;
    }

    var allowNewEntry = this.state.canAddNewEntry && !_.isUndefined(this.state.srcLocale) && !_.isNull(this.state.srcLocale);

    if(allowNewEntry === true) {
      uploadSection = (<ImportModal srcLocale={this.state.srcLocale} transLocales={this.state.locales}/>);
      newEntrySection = (<NewEntryModal className='mh1/2' srcLocale={this.state.srcLocale}/>);
    }

    return (<div>
              <Icons />
              <div className='dfx aic mb1'>
                <div className='fxauto dfx aic'>
                  <h1 className='fz2 dib csec'>System Glossary</h1>
                  <Icon name='chevron-right' className='mh1/2 csec50' size='s1'/>
                  <Select
                    name='language-selection'
                    placeholder='Select a language…'
                    className='w16'
                    value={this.state.selectedTransLocale}
                    options={this.state.localeOptions}
                    onChange={this._handleTransChange}/>
                </div>
                {uploadSection}
                {newEntrySection}
              </div>
              <div className='dfx aic mb1'>
                <div className='fxauto'>
                  <div className='w8'>
                    <Input value={this.state.filter}
                      label='Search Glossary'
                      hideLabel
                      className="w100p pr1&1/2"
                      border='outline'
                      reset
                      placeholder='Search Glossary'
                      id="search"
                      onKeyDown={this._handleFilterKeyDown}
                      onChange={this._handleFilterChange}/>
                  </div>
                </div>
                <div className='dfx aic'>
                  <Icon name='glossary' className='csec50 mr1/4' />
                  <span className='csec'>{count}</span>
                </div>
              </div>
              <div>
                {contents}
              </div>
            </div>);
  }
});

export default SystemGlossary;
