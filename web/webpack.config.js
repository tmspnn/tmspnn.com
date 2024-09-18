const fs = require("fs");
const _ = require("lodash");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const version = require("./package.json").version;

const isProduction = process.env.NODE_ENV == "production";
const pages = fs.readdirSync("./app/pages");

module.exports = {
    context: __dirname + "/app",
    mode: isProduction ? "production" : "development",
    entry: _(["index", "search"] || pages)
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
