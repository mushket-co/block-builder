import '@mushket-co/block-builder/index.esm.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
