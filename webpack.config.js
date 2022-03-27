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
        use: []
      }, {
        test: /\.(scss)$/,
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
