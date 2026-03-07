import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import { WebSocketProvider } from './context/WebSocketContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <WebSocketProvider>
              <App />
            </WebSocketProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
=======
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
>>>>>>> 3264fe2d71ae46e89d250d2faefadef3b5afd739
  </StrictMode>,
)
