const package = require("./package.json");
const version = package.version;

// Plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const atImport = require("postcss-import");
const autoprefixer = require("autoprefixer");
const colorFunction = require("postcss-color-function");
const path = require("path");
const precss = require("precss");

// Entries
const entry = {};
const pages = ["index", "signUp", "signUpTesting", "signIn", "registration", "article", "editor"];
pages.forEach(p => (entry[p] = path.resolve(`frontend/pages/${p}/${p}.ts`)));

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
          {
            loader: "css-loader",
            options: { importLoaders: 1 }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [
                atImport({ path: ["frontend/components/styles"] }),
                precss,
                colorFunction,
                autoprefixer
              ]
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader"
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  resolve: {
    alias: { "@frontend": path.resolve("frontend") },
    extensions: [".js", ".ts"]
  },
  devtool:
    process.env.NODE_ENV === "production" ? "#nosources-source-map" : "#cheap-module-source-map",
  plugins: pages.map(
    () =>
      new MiniCssExtractPlugin({
        filename: `[name]-${version}.css`
      })
  ),
  watchOptions: {
    ignored: ["conf/**", "lua/**", "node_modules/**"]
  }
};
