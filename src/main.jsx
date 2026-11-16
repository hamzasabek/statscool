import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import App from './App.jsx'
import { LangProvider } from './i18n.jsx'
import 'virtual:frameworks.css' // src/styles/frameworks.scss, trimmed (tools/frameworks-css.mjs)
import './index.css'
import './styles/bridge.css' // after index.css: the framework look wins over the older rules

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </LangProvider>
  </StrictMode>,
)
