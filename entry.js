import React from 'react'
import uuid from 'uuid'
import { renderToString } from 'react-dom/server'

export default () => {
  return '<!DOCTYPE html>'.concat(renderToString(
    <html>
      <head>
        <title>react-bootstrap-intl-tel-input</title>
        <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' />
      </head>
      <body>
        <div id='root' />
        <script type='text/javascript' src={`http://localhost:3401/bundle.js`} />
      </body>
    </html>
  ))
}
