const webpack = require('webpack')

const env = process.env.NODE_ENV

const config = {
  devtool: 'source-map',
  entry: './src/index',
  output: {
    filename: 'index.js',
    path: __dirname + '/build', // eslint-disable-line prefer-template
    library: 'brick-lane',
    libraryTarget: 'umd',
  },
  target: 'node',
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  ],
  module: {
    loaders: [
      {test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/},
    ],
  },
}

module.exports = config
