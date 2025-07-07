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
                return reply(`Hi 👋 *${msg.pushName || 'User'}*\n\n🤖 *𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 is Active!*\n\n🧠 Use commands like:\n.menu\n.ping\n.owner\n.sticker`)

            case 'ping':
                return reply('Pong! ✅ Bot is working.')

            case 'owner':
                return reply('My Owner: wa.me/254104260236')

            case 'sticker':
            case 's': {
                const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('../lib/exif')
                const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
                const mime = quoted ? Object.keys(quoted)[0] : null

                if (!quoted || !(mime.includes('image') || mime.includes('video'))) {
                    return reply('📌 Reply to an image or short video to make a sticker.')
                }

                const media = await conn.downloadMediaMessage({ message: quoted }, 'buffer')
                let webp
                if (mime.includes('image')) {
                    const buffer = await imageToWebp(media)
                    webp = await writeExifImg(buffer, '𝐃𝐀𝐕𝐄-𝐗𝐌𝐃', 'gifteddaves')
                } else if (mime.includes('video')) {
                    const buffer = await videoToWebp(media)
                    webp = await writeExifVid(buffer, '𝐃𝐀𝐕𝐄-𝐗𝐌𝐃', 'gifteddaves')
                }

                return conn.sendMessage(from, { sticker: webp }, { quoted: msg })
            }

            default:
                return reply('❌ Command not recognized.')
        }

    } catch (e) {
        console.log('Handler error:', e)
        reply('⚠️ Internal error.')
    }
                    }
