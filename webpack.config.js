const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var stylelint = require('stylelint');
const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};
process.env.BABEL_ENV = TARGET;

const common = {
  entry: {
    app: PATHS.app
  },
  // Add resolve.extensions.
  // '' is needed to allow imports without an extension.
  // Note the .'s before extensions as it will fail to match without!!!
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loaders: ['eslint', 'jscs'],
        include: PATHS.app
    },
    {
      test: /\.css$/,
      loaders: ['postcss'],
      include: PATHS.app
    },
],
loaders: [
// Set up jsx. This accepts js too thanks to RegExp
  {
    test: /\.jsx?$/,
    // Enable caching for improved performance during development
    // It uses default OS directory by default. If you need something
    // more custom, pass a path to it. I.e., babel?cacheDirectory=<path>
    loaders: ['babel?cacheDirectory'],
    include: PATHS.app
  }
]
},
 postcss: function () {
   return [stylelint({
     rules: {
       'color-hex-case': 'lower'
     }
   })];
 },
plugins: [
    new HtmlWebpackPlugin({
        template: 'node_modules/html-webpack-template/index.html',
        title: 'Kanban app',
        appMountId: 'app',
        inject: false
    })
]
};

// Default configuration
if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env so this is easy to customize.
      host: process.env.HOST,
      port: process.env.PORT
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loaders: ['style', 'css'],
                include: PATHS.app
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {
      entry: {
          app: PATHS.app,
          vendor: Object.keys(pkg.dependencies).filter(function(v) {
              return v !== 'alt-utils';
          })
      },
      output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[chunkhash].js'
      },
      module: {
          loaders: [
              {
                  test: /\.css$/,
                  loader: ExtractTextPlugin.extract('style', 'css'),
                  include: PATHS.app
              }
          ]
      },
      plugins: [
          new ExtractTextPlugin('styles.[chunkhash].css'),
          new webpack.optimize.CommonsChunkPlugin({
              names: ['vendor', 'manifest']
          }),
          new webpack.DefinePlugin({
              'process.env.NODE_ENV': JSON.stringify('production')
          }),
          new webpack.optimize.UglifyJsPlugin({
              compress: {
                  warnings: false
              }
          })
      ]
  });
}
