import React from 'react';
import Configs from '../constants/Configs';
import GlossaryStore from '../stores/GlossaryStore';
import { PureRenderMixin } from 'react/addons';
import Actions from '../actions/GlossaryActions';
import { Input, Icons, Icon, Select } from 'zanata-ui'
import GlossaryDataTable from './glossary/GlossaryDataTable'
import GlossarySrcDataTable from './glossary/GlossarySrcDataTable'
import TextInput from './glossary/TextInput'
import { Loader } from 'zanata-ui'
import _ from 'lodash';

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

  _handleFilterKeyDown: function(input, event) {
    if(event.key == 'Enter') {
      Actions.updateFilter(this.state.filter);
    }
  },

  _handleFilterValueChange: function(input, value) {
    this.setState({filter: value});
  },

  _handleFile: function(e) {
    var self = this, reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = function(upload) {
      self.setState({
        uploadFile: {
          uri: upload.target.result,
          file:file
        }
      });
    };
    reader.readAsDataURL(file);
  },

  _uploadFile: function() {
    Actions.uploadFile(this.state.uploadFile,
      this.state.srcLocale.locale.localeId,
      this.state.selectedTransLocale);
  },

  _handleSubmit: function(e) {
    e.preventDefault();
  },

  render: function() {
    var contents = null, count = 0,
      selectedTransLocale = this.state.selectedTransLocale;

    if(selectedTransLocale) {
      contents = (
        <GlossaryDataTable
          glossaryData={this.state.glossary}
          glossaryResId={this.state.glossaryResId}
          totalCount={this.state.glossaryResId.length}
          canAddNewEntry={this.state.canAddNewEntry}
          canUpdateEntry={this.state.canUpdateEntry}
          user={Configs.user}
          sort={this.state.sort}
          srcLocale={this.state.srcLocale}
          selectedTransLocale={selectedTransLocale}/>
      );
    } else {
      contents = (
        <GlossarySrcDataTable
          glossaryData={this.state.glossary}
          glossaryResId={this.state.glossaryResId}
          totalCount={this.state.glossaryResId.length}
          canAddNewEntry={this.state.canAddNewEntry}
          canUpdateEntry={this.state.canUpdateEntry}
          user={Configs.user}
          sort={this.state.sort}
          srcLocale={this.state.srcLocale}/>
      );
    }


    if(this.state.srcLocale) {
      count = this.state.srcLocale.count;
    }

    var uploadSection = "";
    if(this.state.canAddNewEntry) {
      uploadSection = (
        <div>
          <form onSubmit={this._handleSubmit} encType="multipart/form-data">
            <input type="file" onChange={this._handleFile} ref="file" multiple={false} />
            <button className='cpri dfx aic' onClick={this._uploadFile}><Icon name='import' className='mr1/4' /><span>Import Glossary</span></button>
          </form>
      </div>)
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
                    onChange={this._handleTransChange}
                  />
                </div>
                {uploadSection}
              </div>
              <div className='dfx aic mb1'>
                <div className='fxauto'>
                  <div className='w8'>

                    <TextInput value={this.state.filter}
                      className="w100p pr1&1/2"
                      placeholder='Search Glossary'
                      id="search"
                      onKeydownCallback={this._handleFilterKeyDown}
                      onChangeCallback={this._handleFilterValueChange}/>

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
