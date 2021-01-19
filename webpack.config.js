// @Package
const package = require("./package.json")
const version = package.version

// @Plugins
const webpack = require("webpack")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const autoprefixer = require("autoprefixer")
const colorFunction = require("postcss-color-function")
const path = require("path")
const precss = require("precss")

// @Entries
const entry = {}
const pages = [
  "index",
  "signIn",
  "signUp",
  "forgotPassword",
  "resetPassword",
  "editor",
  "article",
  "me"
]
pages.forEach((p) => (entry[p] = path.resolve(`frontend/pages/${p}/${p}.js`)))

module.exports = {
  entry,
  mode: process.env.NODE_ENV || "development",
  output: {
    path: __dirname + "/assets",
    filename: `[name]-${version}.js`,
    publicPath: ""
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 1 } },
          {
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
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
            plugins: [["@babel/plugin-proposal-class-properties", { loose: true }]]
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      "@components": path.resolve("frontend/components"),
      "@util": path.resolve("frontend/util")
    },
    extensions: [".js", ".json"]
  },
  devtool:
    process.env.NODE_ENV === "production" ? "nosources-source-map" : "cheap-module-source-map",
  plugins: [
    new webpack.ProvidePlugin({
      _: "lodash",
      Model: ["@components/MVC", "Model"],
      View: ["@components/MVC", "View"],
      Controller: ["@components/MVC", "Controller"],
      getJSON: ["@util/xhr", "getJSON"],
      postJSON: ["@util/xhr", "postJSON"],
      postFormData: ["@util/xhr", "postFormData"],
      xhr: ["@util/xhr", "default"],
      isJSON: ["@util/isJSON", "default"],
      $: ["@util/DOM", "$"],
      $$: ["@util/DOM", "$$"],
      addClass: ["@util/DOM", "addClass"],
      removeClass: ["@util/DOM", "removeClass"],
      hasClass: ["@util/DOM", "hasClass"],
      html2DOM: ["@util/DOM", "html2DOM"],
      uploadToOSS: ["util/uploadToOSS", "default"]
    }),
    ...pages.map(() => new MiniCssExtractPlugin({ filename: `[name]-${version}.css` }))
  ],
  watchOptions: { ignored: ["conf/**", "lua/**", "node_modules/**"] }
}
