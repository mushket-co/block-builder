/**
 * Освобождает порт перед dev (Windows: netstat + taskkill).
 * Nuxt 4 при занятом порте молча уходит на 3000 — strictPort в config не блокирует fallback.
 */
import { execSync } from 'node:child_process'
import { platform } from 'node:os'

const port = process.argv[2] ?? '3007'

if (platform() !== 'win32') {
  process.exit(0)
}

try {
  const output = execSync(`netstat -ano | findstr ":${port} "`, { encoding: 'utf8' })
  const pids = new Set()

  for (const line of output.split('\n')) {
    if (!line.includes('LISTENING')) {
      continue
    }

    const pid = line.trim().split(/\s+/).at(-1)
    if (pid && pid !== '0') {
      pids.add(pid)
    }
  }

  const myPid = String(process.pid)

  for (const pid of pids) {
    if (pid === myPid) {
      continue
    }

    console.log(`[nuxt4] Port ${port} is in use by PID ${pid}, stopping...`)
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
    } catch {
      // ignore
    }
  }
} catch {
  // port is free
}
