const path = require('path');
let nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: "production",
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../client_packages/'),
    filename: 'bundle.js'
  },
  target: 'node',
  externals: [nodeExternals()],
};