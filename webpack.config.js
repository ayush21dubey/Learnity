const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      "path": "path-browserify",
      "crypto": "crypto-browserify",
      "stream": "stream-browserify",
      "events": "events",
      "process": "process/browser",
      "util": "util",
      "https": "https-browserify",
      "http": "stream-http",
      "url": "url",
      "buffer": "buffer",
      "os": "os-browserify/browser",
      "assert": "assert"
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
}; 