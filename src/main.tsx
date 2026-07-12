import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@/i18n'
import { applyTheme, getInitialTheme } from '@/lib/theme'
import App from './App.tsx'

// Apply the stored theme before first paint to avoid a flash.
applyTheme(getInitialTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
