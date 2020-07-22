const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    mode: 'development',
    entry: {
        main: './main.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                    , options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            [
                                '@babel/plugin-transform-react-jsx',
                                {pragma: "ToyReact.createElement"}
                            ]
                        ]
                    },
                },
            },
        ],
    },
    plugins: [
        new htmlWebpackPlugin({

        })
    ]
};