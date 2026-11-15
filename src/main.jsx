import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import App from './App.jsx'
import { LangProvider } from './i18n.jsx'
import 'virtual:frameworks.css' // src/styles/frameworks.scss, trimmed (tools/frameworks-css.mjs)
import './styles/bridge.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </LangProvider>
  </StrictMode>,
)
