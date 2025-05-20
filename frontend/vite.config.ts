import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5175,
        // все запросы начинающиеся с /api будут проксироваться
        proxy: {
            '/api': {
                target: 'http://localhost:8008',    // твой Synapse
                changeOrigin: true,
                secure: false,
                // переписываем пути:
                // /api/register → /_matrix/client/v3/register
                // /api/rooms    → /_matrix/client/v3/joined_rooms
                // /api/login    → /_matrix/client/v3/login
                rewrite: (path) => {
                    if (path.startsWith('/api/register')) {
                        return path.replace(/^\/api\/register/, '/_matrix/client/v3/register');
                    }
                    if (path.startsWith('/api/rooms')) {
                        return path.replace(/^\/api\/rooms/, '/_matrix/client/v3/joined_rooms');
                    }
                    if (path.startsWith('/api/login')) {
                        return path.replace(/^\/api\/login/, '/_matrix/client/v3/login');
                    }
                    return path;
                },
            },
        },
    },
})
