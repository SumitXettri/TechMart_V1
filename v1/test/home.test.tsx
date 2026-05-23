import React from 'react'
import { renderToString } from 'react-dom/server'
import Home from '../app/page'

describe('Home page', () => {
  it('renders the implementation map heading', () => {
    const element = <Home /> as unknown as React.ReactElement
    const html = renderToString(element)
    expect(html).toMatch(/Implementation map/i)
  })
})
