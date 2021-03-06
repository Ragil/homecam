var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * This is the Webpack configuration file for production.
 */
module.exports = {
  entry: "./src/main",

  output: {
    path: __dirname + "/build/prod/",
    filename: "app.js"
  },

  // Necessary plugins for index.html
  plugins: [
    new HtmlWebpackPlugin({
      filename : 'index.html',
      template : './index.html',
      hash : new Date().valueOf()
    })
  ],

  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },

  resolve: {
    root : path.resolve(__dirname, '.'),
    alias : {
      'env' : 'src/common/env_local.js'
    },
    extensions: ['', '.js', '.jsx']
  }
}
