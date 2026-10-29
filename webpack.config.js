const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        index: {
            import: [ './src/index.js', './src/cube.js', './src/face.js'],
            dependOn: 'three',
        },
        three: 'three',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Rubix !',
      }),
    ],
    resolve: {
        alias: {
          three: path.resolve(__dirname, 'src/utils/three.js'),
        },
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    optimization: {
      runtimeChunk: 'single',
    },
};