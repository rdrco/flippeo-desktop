import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './App.jsx'
import {AuthClient} from "./services/auth.js";

import '@mantine/core/styles.css';
import './index.css'

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
