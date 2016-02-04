var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var _ = require('lodash')
var defaultConfig = require('./webpack.config.js')
var bundleDest = process.env.npm_config_env_bundleDest || __dirname;

module.exports = _.merge({}, defaultConfig, {
  output: {
    path: bundleDest,
    filename: 'frontend.bundle.min.js'
  },
  module: {
    loaders: [
      defaultConfig.module.loaders[0],
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader?safe',
          'autoprefixer-loader?browsers=last 2 versions'
        )
      }
    ]
  },
  plugins: defaultConfig.plugins.concat([
    new ExtractTextPlugin('bundle.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ])
})
