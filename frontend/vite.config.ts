import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5175,
        proxy: {
            '/api': {
                target: 'http://localhost:8008',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => {
                    if (path.startsWith('/api/register')) {
                        return path.replace(/^\/api\/register/, '/_matrix/client/v3/register')
                    }
                    if (path.startsWith('/api/login')) {
                        return path.replace(/^\/api\/login/, '/_matrix/client/v3/login')
                    }
                    if (path.startsWith('/api/createRoom')) {
                        return path.replace(/^\/api\/createRoom/, '/_matrix/client/v3/createRoom')
                    }
                    if(path.startsWith('/api/sync')) {
                        return path.replace(/^\/api\/sync/, '/_matrix/client/r0/sync')
                    }
                    if (path.match(/^\/api\/rooms\?/)) {
                        // список комнат
                        return path.replace(/^\/api\/rooms/, '/_matrix/client/v3/joined_rooms')
                    }
                    if (path.match(/^\/api\/rooms\/[^/]+\/messages/)) {
                        // загрузка сообщений
                        return path.replace(
                            /^\/api\/rooms\/([^/]+)\/messages/,
                            '/_matrix/client/v3/rooms/$1/messages'
                        )
                    }
                    if (path.match(/^\/api\/rooms\/[^/]+\/send/)) {
                        // отправка сообщений
                        return path.replace(
                            /^\/api\/rooms\/([^/]+)\/send/,
                            '/_matrix/client/v3/rooms/$1/send/m.room.message'
                        )
                    }
                    return path
                },
            },
        },
    },
})

