const package = require("./package.json")
const version = package.version

// Plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const autoprefixer = require("autoprefixer")
const colorFunction = require("postcss-color-function")
const path = require("path")
const precss = require("precss")

// Entries
const entry = {}
const pages = ["index", "signIn", "signUp", "forgotPassword", "resetPassword", "editor"]
pages.forEach(p => (entry[p] = path.resolve(`frontend/pages/${p}/${p}.js`)))

module.exports = {
  entry,
  mode: process.env.NODE_ENV || "development",
  output: {
    path: __dirname + "/assets",
    filename: `[name]-${version}.js`,
    publicPath: ""
  },
  module: {
    rules: [{
      test: /\.s?css$/,
      use: [
        MiniCssExtractPlugin.loader,
        { loader: "css-loader", options: { importLoaders: 1 } }, {
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              plugins: [
                ["postcss-import", { path: ["frontend/components/styles"] }],
                precss,
                colorFunction,
                autoprefixer
              ]
            }
          }
        }
      ]
    }, {
      test: /\.m?js$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
        options: {
          presets: [
            ["@babel/preset-env", { targets: "defaults" }]
          ],
          plugins: [
            ["@babel/plugin-proposal-class-properties", { loose: true }]
          ]
        }
      }
    }]
  },
  resolve: {
    alias: {
      "@components": path.resolve("frontend/components"),
      "@util": path.resolve("frontend/util")
    },
    extensions: [".js", ".json"]
  },
  devtool: process.env.NODE_ENV === "production" ? "nosources-source-map" : "cheap-module-source-map",
  plugins: pages.map(() => new MiniCssExtractPlugin({ filename: `[name]-${version}.css` })),
  watchOptions: { ignored: ["conf/**", "lua/**", "node_modules/**"] }
}