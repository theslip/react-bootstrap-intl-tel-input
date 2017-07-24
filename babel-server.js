const fs = require('fs')
const babelrc = JSON.parse(fs.readFileSync('./.babelrc'))

require('babel-register')(babelrc)
require('babel-polyfill')
require('./server')
