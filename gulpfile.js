var gulp = require('gulp');
var webpack = require('gulp-webpack');
var named = require('vinyl-named');
var path = require('path');
gulp.task('default', function () {
    return gulp.src(['src/app.js'])
        .pipe(named())
        .pipe(webpack({
            module: {
                loaders: [
                    {
                        test: /\.vue$/,
                        loader: 'vue'
                    },
                    {
                        test: /\.js$/,
                        loader: 'babel-loader!zk-loader',
                        exclude: /node_modules/
                    }
                ]
            },
            devtool: 'source-map',
            watch: false
        }))
        .pipe(gulp.dest('dist/'));
});