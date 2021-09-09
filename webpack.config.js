// Environment and Version
const isProduction = process.env.NODE_ENV == "production";
const version = require("./package.json").version;

// Internal modules
const fs = require("fs");

// External modules
const _ = require("lodash");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Entries
const pages = ["index", "search"] || fs.readdirSync("./app/pages");

module.exports = {
    context: __dirname + "/app",
    mode: isProduction ? "production" : "development",
    entry: _(pages)
        .keyBy()
        .mapValues((p) => `/pages/${p}/${p}.js`)
        .value(),
    output: {
        path: __dirname + "/build",
        filename: `[name]-${version}.js`,
        publicPath: ""
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: "html-loader"
            },
            {
                test: /\.s?[ac]ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            additionalData:
                                '@import "app/components/base.scss";'
                        }
                    }
                ]
            }
        ]
    },
    devtool: false,
    plugins: [
        ...pages.map(
            () =>
                new MiniCssExtractPlugin({ filename: `[name]-${version}.css` })
        )
    ],
    watchOptions: { ignored: ["conf/**", "lua/**"] }
};
