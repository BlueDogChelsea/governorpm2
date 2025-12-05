import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { electronMock } from './mocks/electronMock'

// Inject Mock API if running in browser (no electronAPI present)
if (!window.electronAPI) {
    console.log('[Dev] Running in Browser Mode - Injecting Mock Electron API')
    window.electronAPI = electronMock
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
