import { createServer } from 'node:http'

const [,, command] = process.argv

if (command === 'start') {
  const port = Number(process.env.PORT ?? 3001)

  // Attempt to load retrofit.config from cwd
  let config: unknown
  try {
    const configPath = new URL('retrofit.config.js', `file://${process.cwd()}/`)
    const mod = await import(configPath.href)
    config = mod.default ?? mod
  } catch {
    console.error('Could not load retrofit.config.js from', process.cwd())
    process.exit(1)
  }

  const { createExpressRouter } = await import('./adapters/express.js')
  // Dynamic express import
  const express = (await import('express')).default
  const app = express()
  app.use(express.json())
  app.use(createExpressRouter(config as Parameters<typeof createExpressRouter>[0]))

  createServer(app).listen(port, () => {
    console.log(`retrofit-server running on http://localhost:${port}`)
  })
} else {
  console.log('Usage: retrofit-server start')
  process.exit(0)
}
