const webpack = require("webpack");
const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
require("dotenv").config();

const config = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  entry: ["babel-polyfill", "./src/app.js"],
  plugins: [
    // new UglifyJSPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
        PARR_URL: JSON.stringify(process.env.PARR_URL),
        GA_ID: JSON.stringify(process.env.GA_ID)
      }
    })
  ],
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  devServer: {
    historyApiFallback: true
  }
});

module.exports = config;
