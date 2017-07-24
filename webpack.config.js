const path = require('path')
const webpack = require('webpack')
const loaders = require('./webpack/loaders')

module.exports = {
  entry: {
    'app': [
      'babel-polyfill',
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      path.join(__dirname, './client')
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  devtool: 'inline-source-map',
  devServer: {
    host: 'localhost',
    publicPath: '/',
    port: 3401,
    historyApiFallback: true,
    hot: true,
    compress: true
  },
  module: {
    loaders
  }
}
