
const invoke = window.__TAURI__.invoke

export const Vault = {
    save: async (account, value) => {
        return await invoke('vault_save', { service: "flippeo", account, value })
    },
    read: async (account) => {
        try {
            return await invoke('vault_read', { service: "flippeo", account })
        } catch (e) {
            return null
        }
    },
    delete: async (account) => {
        try {
            await invoke('vault_delete', { service: "flippeo", account })
        } catch { /* empty */ }
    },
}