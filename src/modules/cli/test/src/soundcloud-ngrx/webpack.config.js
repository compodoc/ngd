const path = require('path');

const autoprefixer = require('autoprefixer');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const WebpackMd5Hash = require('webpack-md5-hash');


//=========================================================
//  VARS
//---------------------------------------------------------
const NODE_ENV = process.env.NODE_ENV;

const ENV_DEVELOPMENT = NODE_ENV === 'development';
const ENV_PRODUCTION = NODE_ENV === 'production';
const ENV_TEST = NODE_ENV === 'test';

const HOST = '0.0.0.0';
const PORT = 3000;


//=========================================================
//  LOADERS
//---------------------------------------------------------
const rules = {
  componentStyles: {
    test: /\.scss$/,
    loader: 'raw!postcss!sass',
    exclude: path.resolve('src/shared/styles')
  },
  sharedStyles: {
    test: /\.scss$/,
    loader: 'style!css!postcss!sass',
    include: path.resolve('src/shared/styles')
  },
  typescript: {
    test: /\.ts$/,
    loader: 'ts',
    exclude: /node_modules/
  }
};


//=========================================================
//  CONFIG
//---------------------------------------------------------
const config = module.exports = {};

config.resolve = {
  extensions: ['.ts', '.js'],
  mainFields: ['module', 'browser', 'main'],
  modules: [
    path.resolve('.'),
    'node_modules'
  ]
};

config.module = {
  rules: [
    rules.typescript,
    rules.componentStyles
  ]
};

config.plugins = [
  new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    'process.env.SOUNDCLOUD_CLIENT_ID': JSON.stringify(process.env.SOUNDCLOUD_CLIENT_ID)
  }),
  new LoaderOptionsPlugin({
    debug: false,
    minimize: ENV_PRODUCTION,
    options: {
      postcss: [
        autoprefixer({browsers: ['last 3 versions']})
      ],
      resolve: {},
      sassLoader: {
        includePaths: ['src/shared'],
        outputStyle: 'compressed',
        precision: 10,
        sourceComments: false
      }
    }
  }),
  new ContextReplacementPlugin(
    /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
    path.resolve('src')
  )
];


//=====================================
//  DEVELOPMENT or PRODUCTION
//-------------------------------------
if (ENV_DEVELOPMENT || ENV_PRODUCTION) {
  config.entry = {
    main: './src/main.ts',
    polyfills: './src/polyfills.ts'
  };

  config.output = {
    path: path.resolve('./target'),
    publicPath: '/'
  };

  config.plugins.push(
    new CommonsChunkPlugin({
      name: ['polyfills'],
      minChunks: Infinity
    }),
    new HtmlWebpackPlugin({
      chunkSortMode: 'dependency',
      filename: 'index.html',
      hash: false,
      inject: 'body',
      template: './src/index.html'
    })
  );
}


//=====================================
//  DEVELOPMENT
//-------------------------------------
if (ENV_DEVELOPMENT) {
  config.devtool = 'cheap-module-source-map';

  config.output.filename = '[name].js';

  config.module.rules.push(rules.sharedStyles);

  config.plugins.push(new ProgressPlugin());

  config.devServer = {
    contentBase: './src',
    historyApiFallback: true,
    host: HOST,
    port: PORT,
    stats: {
      cached: true,
      cachedAssets: true,
      chunks: true,
      chunkModules: false,
      colors: true,
      hash: false,
      reasons: true,
      timings: true,
      version: false
    }
  };
}


//=====================================
//  PRODUCTION
//-------------------------------------
if (ENV_PRODUCTION) {
  config.devtool = 'hidden-source-map';

  config.output.filename = '[name].[chunkhash].js';

  config.module.rules.push({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract('css?-autoprefixer!postcss!sass'),
    include: path.resolve('src/shared/styles')
  });

  config.plugins.push(
    new WebpackMd5Hash(),
    new ExtractTextPlugin('styles.[contenthash].css'),
    new UglifyJsPlugin({
      comments: false,
      compress: {
        dead_code: true, // eslint-disable-line camelcase
        screw_ie8: true, // eslint-disable-line camelcase
        unused: true,
        warnings: false
      },
      mangle: {
        screw_ie8: true  // eslint-disable-line camelcase
      }
    })
  );
}


//=====================================
//  TEST
//-------------------------------------
if (ENV_TEST) {
  config.devtool = 'inline-source-map';

  config.module.rules.push(rules.sharedStyles);
}
