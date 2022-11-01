'use strict'

const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'development',
  entry: {
    display: './src/display/app.js',
    mobile: './src/mobile/app.js',
    water: './src/water/app.js',
    wind: './src/wind/app.js',
  },
  output: {
    path: __dirname + '/view',
    publicPath: '/',
    filename: '[name]/main.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}