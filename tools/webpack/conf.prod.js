const fs = require('fs')
const webpack = require('webpack')
const merge = require('webpack-merge')

/* Config */
const port = 8080
const ip = require('../config/ip')
const urls = require('../urls')
const webpackConfBase = require('./conf.base')
const loaders = require('./loaders')

/* Webpack Plugins */
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const ManifestPlugin = require('webpack-manifest-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const imageminMozjpeg = require('imagemin-mozjpeg')
const Visualizer = require('webpack-visualizer-plugin')

const webpackConf = merge(webpackConfBase, {
  devtool: '#source-map',
  output: {
    filename: 'assets/js/[name].[chunkhash:8].js',
    chunkFilename: 'assets/js/[name].[chunkhash:8].js'
  },
  module: {
    rules: [
      ...loaders.style({ sourceMap: true, extract: true }),
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'url',
        options: {
          limit: 1000,
          name: 'assets/imgs/[name].[hash:8].[ext]'
        }
      }, {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        loader: 'url',
        options: {
          limit: 10000,
          name: 'assets/fonts/[name].[hash:8].[ext]'
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' }
    }),
    new webpack.BannerPlugin(`Build by SebastianBlade, at ${(new Date()).toLocaleString()}`),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }),
    new ImageminPlugin({
      disable: false,
      optipng: { optimizationLevel: 3 },
      gifsicle: { optimizationLevel: 1 },
      jpegtran: { progressive: false },
      svgo: { plugins: [{ removeViewBox: false }] },
      pngquant: { quality: '70-85' },
      plugins: [imageminMozjpeg({ quality: 90 })]
    }),
    new ExtractTextPlugin('assets/css/[name].[contenthash:8].css'),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.DedupePlugin(),
    new WebpackMd5Hash(),
    new ManifestPlugin(),
    new Visualizer({ filename: `../tools/webpack/analytics.html` })
  ],
  recordsPath: `${urls.temp}/.webpack-records.json`
})

fs.writeFileSync(`${urls.temp}/config.prod.json`, JSON.stringify(webpackConf, null, 2), 'utf8')

module.exports = webpackConf
