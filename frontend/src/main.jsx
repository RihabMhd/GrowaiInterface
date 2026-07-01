import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './routes/AppRoutes.jsx'
import AuthProvider from './auth/AuthContext.jsx'
import LanguageProvider from './context/LanguageContext.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <ShopProvider>
            <AppRoutes />
          </ShopProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)