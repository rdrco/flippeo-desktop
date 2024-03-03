import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {AuthClient} from "./services/auth.js";

const run = async () => {
    await AuthClient.handleAuth()

    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
}

run().catch((err) => {
    console.error(err)
})
