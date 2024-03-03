const invoke = window.__TAURI__.invoke

export const Tauri = {
    closeSplash: () => {
        invoke('close_splashscreen')
    }
}