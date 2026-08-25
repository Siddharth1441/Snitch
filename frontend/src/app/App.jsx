import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes.jsx'
import { Provider } from 'react-redux'
import { store } from './app.store.js'
import AuthInitializer from '../features/auth/components/AuthInitializer.jsx'

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <RouterProvider router={routes} />
      </AuthInitializer>
    </Provider>
  )
}

export default App
