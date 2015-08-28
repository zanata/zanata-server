import React from 'react';
import Configs from '../constants/Configs';
import GlossaryStore from '../stores/GlossaryStore';
import DropDown from './DropDown';
import {PureRenderMixin} from 'react/addons';
import Actions from '../actions/GlossaryActions';
import GlossaryDataTable from './GlossaryDataTable'
import { Input, Icons, Icon, Select } from 'zanata-ui'


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

    var localeList = [
      {
        value: 'de',
        label: 'German'
      },
      {
        value: 'fr',
        label: 'French'
      }
    ]

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

    return (<div>
              <Icons fileName='./node_modules/zanata-ui/src/components/Icons/icons.svg' />
              <div className='dfx aic mb1'>
                <div className='fxauto dfx aic'>
                  <h1 className='fz2 dib csec'>System Glossary</h1>
                  <Icon name='chevron-right' className='mh1/2 csec50' size='s1'/>
                  <Select
                    name='language-selection'
                    placeholder='Select a language'
                    className='w16'
                    options={localeList}
                  />
                </div>
                <div>
                  <button className='cpri dfx aic'><Icon name='import' className='mr1/4' /><span>Import Glossary</span></button>
                </div>
              </div>
              <div className='dfx aic mb1'>
                <div className='fxauto'>
                  <div className='posr w8'>
                    <Input label='Search Glossary' outline className='w100p pr1&1/2' type='search' placeholder='Search Glossary' />
                    <button className='posa r0 t0 fzn1 h1&1/2 p1/4 csec50 dfx aic'>
                      <Icon name='search' size='s1' />
                    </button>
                  </div>
                </div>
                <div className='dfx aic'>
                  <Icon name='glossary' className='csec50 mr1/4' />
                  <span className='csec'>{this.state.glossary.length}</span>
                </div>
              </div>
              <div>
                {contents}
              </div>
            </div>);
  }
});

export default SystemGlossary;
