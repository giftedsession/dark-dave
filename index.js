// 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 ⚡ Auto-Restart Launcher (index.js)

const { spawn } = require('child_process')
const path = require('path')

function start() {
  const args = [path.join(__dirname, 'main.js'), ...process.argv.slice(2)]

  console.log('\n🟢 Launching 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃...\n')
  console.log([process.argv[0], ...args].join(' '))

  const proc = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })

  proc.on('message', data => {
    if (data === 'reset') {
      console.log('🔁 Restart signal received. Restarting bot...\n')
      proc.kill()
      start()
    }
  })

  proc.on('exit', code => {
    console.log(`⚠️ Bot exited with code: ${code}`)
    if (code === 0 || code === 1 || code === '.') {
      console.log('🔄 Restarting bot...')
      start()
    }
  })
}

start()
