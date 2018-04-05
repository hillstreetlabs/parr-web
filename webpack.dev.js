const webpack = require("webpack");
const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

const config = merge(common, {
  devtool: "eval-source-map",
  entry: ["babel-polyfill", "./src/app.js", "webpack-hot-middleware/client"],
  plugins: [
    // new UglifyJSPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
        PARR_URL: JSON.stringify(process.env.PARR_URL)
      }
    })
  ]
});

module.exports = config;
