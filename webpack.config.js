// Env and version
const isProduction = process.env.NODE_ENV == "production";
const version = require("./package.json").version;

// External modules
const _ = require("lodash");
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const colorFunction = require("postcss-color-function");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const precss = require("precss");

// Pages
const pages = [
    "index",
    "signIn",
    "signUp",
    "forgotPassword",
    "resetPassword",
    "editor",
    "article",
    "me",
    "user"
];

module.exports = {
    context: __dirname + "/frontend",
    entry: _(pages)
        .keyBy()
        .mapValues((p) => `/pages/${p}/${p}.js`)
        .value(),
    mode: isProduction ? "production" : "development",
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
                                    [
                                        "postcss-import",
                                        {
                                            path: [
                                                "frontend/components",
                                                "frontend/components/styles"
                                            ]
                                        }
                                    ],
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
                        presets: [
                            ["@babel/preset-env", { targets: "defaults" }]
                        ],
                        plugins: [
                            [
                                "@babel/plugin-proposal-class-properties",
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
            "@components": __dirname + "/frontend/components",
            "@util": __dirname + "/frontend/util"
        },
        extensions: [".js", ".json"]
    },
    devtool:
        process.env.NODE_ENV === "production"
            ? "nosources-source-map"
            : "cheap-module-source-map",
    plugins: [
        new webpack.ProvidePlugin({
            _: "lodash",
            View: ["@components/vc", "View"],
            Controller: ["@components/vc", "Controller"],
            getJSON: ["@util/xhr", "getJSON"],
            postJSON: ["@util/xhr", "postJSON"],
            postFormData: ["@util/xhr", "postFormData"],
            xhr: ["@util/xhr", "default"],
            isJSON: ["@util/isJSON", "default"],
            $: ["@util/DOM", "$"],
            $$: ["@util/DOM", "$$"],
            addClass: ["@util/DOM", "addClass"],
            removeClass: ["@util/DOM", "removeClass"],
            toggleClass: ["@util/DOM", "toggleClass"],
            hasClass: ["@util/DOM", "hasClass"],
            cloneNode: ["@util/DOM", "cloneNode"],
            replaceNode: ["@util/DOM", "replaceNode"],
            clearNode: ["@util/DOM", "clearNode"],
            html2DOM: ["@util/DOM", "html2DOM"],
            uploadToOSS: ["@util/uploadToOSS", "default"]
        }),
        pages.map(
            () =>
                new MiniCssExtractPlugin({ filename: `[name]-${version}.css` })
        )
    ],
    watchOptions: { ignored: ["conf/**", "lua/**", "node_modules/**"] }
};
