const path = require('path')
const fs = require('fs')
const babelrc = JSON.parse(fs.readFileSync('./.babelrc'))

module.exports = [
  { test: /\.js?$/,
    exclude: /node_modules/,
    loader: `babel-loader?${JSON.stringify({
      presets: babelrc.presets,
      plugins: babelrc.plugins
    })}`
  },
  { test: /\.json$/, loader: 'json-loader' },
  { test: /\.css$/, loader: 'style-loader!css-loader' },
  { test: /.(png|woff(2)?|eot|ttf|svg)(\?[#a-z0-9=.]+)?$/, loader: 'url-loader' }
]
