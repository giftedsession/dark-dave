/**
 * DAVE-XMD - Handler Engine
 * This routes messages to command modules
 */

const prefix = '.'

exports.handler = async (conn, m) => {
    const msg = m.messages[0]
    if (!msg || !msg.message || (msg.key && msg.key.remoteJid === 'status@broadcast')) return

    let text = msg.message?.conversation || 
               msg.message?.extendedTextMessage?.text || 
               msg.message?.imageMessage?.caption || 
               msg.message?.videoMessage?.caption || ''
    if (!text.startsWith(prefix)) return

    const args = text.trim().split(/ +/)
    const command = args.shift().slice(1).toLowerCase()

    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? msg.key.participant : from
    const isOwner = ['254104260236@s.whatsapp.net'].includes(sender)

    const reply = (text) => conn.sendMessage(from, { text }, { quoted: msg })

    try {
        switch (command) {
            case 'menu':
                return reply(`Hi 👋 *${msg.pushName || 'User'}*\n\n🤖 *𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 is Active!*\n\n🧠 Use commands like:\n.menu\n.ping\n.owner`)
            case 'ping':
                return reply('Pong! ✅ Bot is working.')
            case 'owner':
                return reply('My Owner: wa.me/254104260236')
            default:
                return reply('❌ Command not recognized.')
        }
    } catch (e) {
        console.log('Handler error:', e)
        reply('⚠️ Internal error.')
    }
      }
