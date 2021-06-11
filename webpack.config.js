// Environment and version
const isProduction = process.env.NODE_ENV == "production";
const version = require("./package.json").version;

// Internal modules
const fs = require("fs");

// External modules
const _ = require("lodash");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Entries
const pages = fs.readdirSync("./app/pages");

module.exports = {
    context: __dirname + "/app",
    entry: _(pages)
        .keyBy()
        .mapValues((p) => `/pages/${p}/${p}.js`)
        .value(),
    mode: isProduction ? "production" : "development",
    output: {
        path: __dirname + "/build",
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
                                    [
                                        "postcss-import",
                                        { path: ["app/styles"] }
                                    ],
                                    "autoprefixer",
                                    "precss"
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
                        presets: [
                            [
                                "@babel/preset-env",
                                { targets: "last 1 chrome version" }
                            ]
                        ],
                        plugins: [
                            [
                                "@babel/plugin-proposal-class-properties",
                                { loose: true }
                            ],
                            [
                                "@babel/plugin-proposal-private-methods",
                                { loose: true }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            "@components": __dirname + "/app/components",
            "@helpers": __dirname + "/app/helpers"
        },
        extensions: [".js", ".json"]
    },
    devtool: "source-map",
    plugins: [
        new webpack.ProvidePlugin({
            _: "lodash",
            View: ["@components/VC", "View"],
            Controller: ["@components/VC", "Controller"],
            $: ["k-dom", "$"],
            $$: ["k-dom", "$$"],
            hasClass: ["k-dom", "hasClass"],
            addClass: ["k-dom", "addClass"],
            removeClass: ["k-dom", "removeClass"],
            clearNode: ["k-dom", "clearNode"],
            removeNode: ["k-dom", "removeNode"],
            html2DOM: ["k-dom", "html2DOM"],
            isJSON: ["k-util", "isJSON"],
            parseJSON: ["k-util", "parseJSON"],
            toArray: ["k-util", "toArray"],
            each: ["k-util", "each"],
            at: ["k-util", "at"]
        }),
        ...pages.map(
            () =>
                new MiniCssExtractPlugin({ filename: `[name]-${version}.css` })
        )
    ],
    watchOptions: { ignored: ["conf/**", "lua/**", "node_modules/**"] }
};
