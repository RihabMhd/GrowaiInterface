import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './routes/AppRoutes.jsx'
import AuthProvider from './auth/AuthContext.jsx'
import LanguageProvider from './context/LanguageContext.jsx'
import { ShopProvider } from './context/ShopContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <ShopProvider>
          <AppRoutes />
        </ShopProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>
)