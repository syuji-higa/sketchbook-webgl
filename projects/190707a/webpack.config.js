const { join } = require('path')
const CopyPlugin = require('copy-webpack-plugin')

const projectName = __dirname.match(/([^\/.]+)/g).slice(-1)[0]

const config = {
  output: {
    path: join(__dirname, '../../docs', projectName)
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(frag|vert|glsl)$/,
        use: 'webpack-glsl-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts']
  }
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'cheap-module-eval-source-map'
    config.devServer = {
      contentBase: join(__dirname, './src'),
      watchContentBase: true
    }
  } else if (argv.mode === 'production') {
    config.plugins = [
      new CopyPlugin(
        [
          {
            from: 'src/index.html',
            to: join('../../docs', projectName),
            force: true
          },
          {
            from: 'src/*.+(png|jpg|gif)',
            to: join('../../docs', projectName, '[name].[ext]'),
            type: 'template',
            force: true
          }
        ],
        { copyUnmodified: true }
      )
    ]
  }
  return config
}
