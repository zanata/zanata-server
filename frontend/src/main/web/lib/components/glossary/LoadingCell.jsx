import React from 'react'
import { Loader } from 'zanata-ui'

var LoadingCell = React.createClass({
  render: function () {
    return (<span className='h1&1/2 csec'><Loader size='1' /></span>)
  }
})

export default LoadingCell
