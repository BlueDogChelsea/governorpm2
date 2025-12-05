/**
 * Mock Electron API for Browser Development
 * Uses localStorage to simulate file system persistence.
 */

const STORAGE_PREFIX = 'governor_mock_fs:'

export const electronMock = {
    ensureFolder: async (path) => {
        console.log(`[Mock Electron] Ensure folder: ${path}`)
        return true
    },

    readJSON: async (path) => {
        console.log(`[Mock Electron] Read JSON: ${path}`)
        const key = STORAGE_PREFIX + path
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : null
    },

    writeJSON: async (path, data) => {
        console.log(`[Mock Electron] Write JSON: ${path}`, data)
        const key = STORAGE_PREFIX + path
        localStorage.setItem(key, JSON.stringify(data))
        return true
    }
}
