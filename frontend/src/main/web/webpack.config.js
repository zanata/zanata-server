var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: './src/index',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: path.join(__dirname, 'src'),
        loader: 'atomic-loader?configPath=' + __dirname +
          '/atomicCssConfig.js' +
          '!babel?' + JSON.stringify({
            presents: ['react', 'stage-0', 'es2015']
          })
      },
      {
        test: /\.css$/,
        include: path.join(__dirname, 'src'),
        loader: 'style!css!autoprefixer?browsers=last 2 versions'
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx', '.json', '.css']
  },
  node: {
    __dirname: true
  }
}
