const path = require('path');

module.exports = {
  loader: 'sass-loader',
  options: {
    sourceMap: true
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'scss')
    ]
  },
  output: {
    filename: 'dist/index.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ]
      }
    ]
  }
};
