import { useState } from 'react'
import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes.jsx'
import { Provider } from 'react-redux'
import { store } from './app.store.js'

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={routes} />
    </Provider>
  )
}

export default App
