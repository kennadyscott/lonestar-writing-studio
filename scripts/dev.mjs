// Runs the API backend and the Vite dev server together (zero external deps).
import { spawn } from 'node:child_process'

function run(cmd, args, name, color) {
  const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], env: process.env })
  const tag = `\x1b[${color}m[${name}]\x1b[0m `
  p.stdout.on('data', (d) => process.stdout.write(tag + d.toString().replace(/\n(?!$)/g, '\n' + tag)))
  p.stderr.on('data', (d) => process.stderr.write(tag + d.toString().replace(/\n(?!$)/g, '\n' + tag)))
  p.on('exit', (code) => {
    console.log(`${tag}exited with code ${code}`)
    process.exit(code ?? 0)
  })
  return p
}

run('node', ['server/index.mjs'], 'api', '36')
run('npx', ['vite'], 'web', '35')

process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))
