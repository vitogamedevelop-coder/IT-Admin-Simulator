import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

function cyberlearnBuildStampPlugin() {
  return {
    name: 'cyberlearn-build-stamp',
    closeBundle() {
      const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
      const version = pkg.version
      const distDir = path.resolve('./dist')

      // 1. Inject the versioned cache name into the service worker.
      const swPath = path.join(distDir, 'sw.js')
      if (fs.existsSync(swPath)) {
        let sw = fs.readFileSync(swPath, 'utf8')
        sw = sw.replace(/__APP_VERSION__/g, version)
        fs.writeFileSync(swPath, sw)
        console.log(`[build-stamp] sw.js cache bucket = cyberlearn-v${version}`)
      }

      // 2. Add a build hash/timestamp to version.json for runtime verification.
      const versionJsonPath = path.join(distDir, 'version.json')
      let versionJson = { version, buildHash: null, buildTime: null }
      if (fs.existsSync(versionJsonPath)) {
        try {
          versionJson = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'))
        } catch { /* ignore */ }
      }

      const indexHtmlPath = path.join(distDir, 'index.html')
      if (fs.existsSync(indexHtmlPath)) {
        const html = fs.readFileSync(indexHtmlPath, 'utf8')
        versionJson.buildHash = crypto.createHash('sha256').update(html).digest('hex').slice(0, 12)
      } else {
        versionJson.buildHash = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      }
      versionJson.buildTime = new Date().toISOString()
      fs.writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2))
      console.log(`[build-stamp] version.json buildHash = ${versionJson.buildHash}`)

      // 3. Drop a diagnostic asset the app can request to prove it loads current assets.
      const runtimeInfoPath = path.join(distDir, 'build-info.json')
      fs.writeFileSync(runtimeInfoPath, JSON.stringify({
        version,
        buildHash: versionJson.buildHash,
        buildTime: versionJson.buildTime,
        cacheName: `cyberlearn-v${version}`,
      }, null, 2))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cyberlearnBuildStampPlugin()],
  base: process.env.VITE_BASE_URL || '/',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || 'dev'),
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
