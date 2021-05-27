// Environment and version
const isProduction = process.env.NODE_ENV == "production";
const version = require("./package.json").version;

// External modules
const _ = require("lodash");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Pages
const pages = [
    "index",
    // "article",
    "trending",
    "messages",
    "me",
    "signIn"
    // "signUp",
    // "forgotPassword",
    // "resetPassword",
    // "editor",
    // "article",
    // "user"
];

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
                            ["@babel/preset-env", { targets: "defaults" }]
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
            kxhr: ["k-xhr", "default"],
            $: ["k-dom", "$"],
            $$: ["k-dom", "$$"],
            addClass: ["k-dom", "addClass"],
            removeClass: ["k-dom", "removeClass"],
            clearNode: ["k-dom", "clearNode"],
            removeNode: ["k-dom", "removeNode"],
            isInt: ["k-util", "isInt"],
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
