const webpack = require('webpack');
const path = require('path');

class NodePolyfillPlugin {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap('NodePolyfillPlugin', (factory) => {
      factory.hooks.resolve.tap('NodePolyfillPlugin', (resolveData) => {
        if (resolveData.request.startsWith('node:')) {
          resolveData.request = resolveData.request.slice(5);
        }
      });
    });
  }
}

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        fallback: {
          "path": require.resolve("path-browserify"),
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify"),
          "events": require.resolve("events"),
          "process": require.resolve("process/browser.js"),
          "util": require.resolve("util"),
          "https": require.resolve("https-browserify"),
          "http": require.resolve("stream-http"),
          "url": require.resolve("url"),
          "buffer": require.resolve("buffer"),
          "os": require.resolve("os-browserify/browser"),
          "assert": require.resolve("assert"),
          "querystring": require.resolve("querystring-es3"),
          "vm": require.resolve("vm-browserify"),
          "fs": false,
          "net": false,
          "tls": false,
          "child_process": false
        }
      };

      // Add polyfills.js as the first entry point
      webpackConfig.entry = [
        path.resolve(__dirname, 'src/polyfills.js'),
        ...(Array.isArray(webpackConfig.entry) ? webpackConfig.entry : [webpackConfig.entry])
      ];

      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer']
        }),
        new NodePolyfillPlugin(),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          'process.platform': JSON.stringify('browser')
        })
      ];

      webpackConfig.module = {
        ...webpackConfig.module,
        rules: [
          ...webpackConfig.module.rules,
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false
            }
          }
        ]
      };

      return webpackConfig;
    }
  }
}; 