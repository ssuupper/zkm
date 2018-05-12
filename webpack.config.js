const path = require('path');

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js'
    },
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.js'
        }
    },
    devtool: '#source-map',
    module: {
        loaders: [
            { test: /\.vue$/, loader: 'vue-loader' }, // 所有.vue结尾的文件，使用vue-loader
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ } // .js文件使用babel-loader，切记排除node_modules目录
        ]
    }
};