const path = require('path')

module.exports = {
  mode: 'production',
  entry: ['./src/js/app.js',
    './src/scss/custom.scss'
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist', 'js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: []
      }, {
        test: /\.(scss)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: { outputPath: '../css/', name: 'styles.min.css' }
          },
          {
            // Run postcss actions
            loader: 'postcss-loader'
          },
          {
            // compiles Sass to CSS
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
}
