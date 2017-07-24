import Koa from 'koa'
import serve from 'koa-static-server'
import path from 'path'
import http from 'http'
import fs from 'fs-promise'
import Index from './entry'

const app = new Koa()
const port = 3400

app.use(async function (ctx, next) {
  ctx.body = Index()
})

http.createServer(app.callback()).listen(port, 'localhost', () => {
  console.info(`==> 🌎  Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`)
})
