const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const externals = {
  react: {
    root: 'React',
    commonjs2: 'react',
    commonjs: 'react',
    amd: 'react'
  },
  redux: {
    root: 'Redux',
    commonjs2: 'redux',
    commonjs: 'redux',
    amd: 'redux'
  }
}

const config = {
  externals,
  devtool: 'source-map',
  entry: './src/index',
  output: {
    filename: 'index.js',
    path: __dirname,
    library: 'Mirror',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV'])
  ],
  module: {
    loaders: [
      {test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/},
    ],
  },
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new LodashModuleReplacementPlugin({paths: true}),
    new webpack.optimize.OccurrenceOrderPlugin()
  )
}

module.exports = config
