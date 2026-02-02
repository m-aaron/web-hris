import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import "@fontsource/poppins/300.css";   // Light
import "@fontsource/poppins/400.css";   // Regular
import "@fontsource/poppins/500.css";   // Medium
import "@fontsource/poppins/600.css";   // Semi Bold
import "@fontsource/poppins/700.css";   // Bold
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
        <App />
    </AuthProvider>
  </BrowserRouter>,
)
