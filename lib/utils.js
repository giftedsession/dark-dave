/**
 * DAVE-XMD - Message Utility Serializer
 * Adds flags and shortcuts to incoming messages
 */

exports.serialize = (m) => {
    const message = m.messages[0]
    if (!message) return m

    m.id = message.key.id
    m.isGroup = message.key.remoteJid.endsWith('@g.us')
    m.sender = m.isGroup ? message.key.participant : message.key.remoteJid
    m.from = message.key.remoteJid
    m.message = message.message
    m.type = Object.keys(m.message || {})[0]

    // Extract text body
    m.body = (
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        ''
    )

    m.isCmd = m.body.startsWith('.')
    m.command = m.isCmd ? m.body.slice(1).trim().split(/ +/).shift().toLowerCase() : null
    m.args = m.isCmd ? m.body.trim().split(/ +/).slice(1) : []

    m.quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null
    m.mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    m.isImage = m.type === 'imageMessage'
    m.isVideo = m.type === 'videoMessage'
    m.isSticker = m.type === 'stickerMessage'
    m.isAudio = m.type === 'audioMessage'
    m.isDocument = m.type === 'documentMessage'

    return m
      }
