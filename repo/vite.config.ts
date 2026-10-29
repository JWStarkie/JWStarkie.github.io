import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { normalizePath } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'resume-data-refresh',
      configureServer(server) {
        const resumePath = normalizePath(resolve(server.config.publicDir, 'resumeData.json'))
        const refresh = (file: string) => {
          if (normalizePath(file) === resumePath) server.ws.send({ type: 'full-reload' })
        }
        server.watcher.add(resumePath)
        server.watcher.on('change', refresh)
        server.httpServer?.once('close', () => server.watcher.off('change', refresh))
      },
    },
  ],
  base: './',
  server: { host: '127.0.0.1', port: 3000, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    restoreMocks: true,
    clearMocks: true,
  },
})
