'use strict'

const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'development',
  entry: {
    desktop: './src/desktop/app.js',
    mobile: './src/mobile/app.js',
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