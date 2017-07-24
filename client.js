import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Routes } from './Routes'

const element = document.getElementById('root')

render(
  <BrowserRouter>
    <Routes />
  </BrowserRouter>,
  element
)
