var webpack = require('webpack')
var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var _ = require('lodash')
var defaultConfig = require('./webpack.prod.config.js')
var bundleDest = process.env.npm_config_bundleDest || __dirname

module.exports = _.merge({}, defaultConfig, {
  entry: './src/legacy',
  output: {
    path: bundleDest,
    filename: 'frontend.legacy.min.js'
  }
})
