const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

const config = merge(common, {
  entry: ["babel-polyfill", "./src/app.js"],
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
        PARR_URL: JSON.stringify(process.env.PARR_URL)
      }
    })
  ]
});

module.exports = config;
