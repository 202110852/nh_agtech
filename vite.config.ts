import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const SW_COMMIT_PLACEHOLDER = '__GIT_COMMIT__'

function gitCommitHash() {
  const fromEnv = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA
  if (fromEnv) return fromEnv.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'dev'
  }
}

function injectSwGitHash(): Plugin {
  const hash = gitCommitHash()
  return {
    name: 'inject-sw-git-hash',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/sw.js') {
          next()
          return
        }
        const source = readFileSync(path.resolve('public/sw.js'), 'utf8')
        res.setHeader('Content-Type', 'application/javascript')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(source.replaceAll(SW_COMMIT_PLACEHOLDER, hash))
      })
    },
    writeBundle(options) {
      const swPath = path.join(options.dir ?? 'dist', 'sw.js')
      const source = readFileSync(swPath, 'utf8')
      writeFileSync(swPath, source.replaceAll(SW_COMMIT_PLACEHOLDER, hash))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), injectSwGitHash()],
  base: '/',
  server: {
    port: 5173,
    strictPort: true,
  },
})
