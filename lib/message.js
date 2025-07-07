/**
 * DAVE-XMD - Message Parser (smsg)
 * Formats and prepares incoming messages using serialize()
 */

const { serialize } = require('./utils')
const { proto } = require('@whiskeysockets/baileys')

exports.smsg = async (conn, m) => {
    if (!m) return m

    const msg = m.messages[0]
    if (!msg.message) return

    const M = proto.WebMessageInfo

    msg.id = msg.key.id
    msg.chat = msg.key.remoteJid
    msg.fromMe = msg.key.fromMe
    msg.isGroup = msg.chat.endsWith('@g.us')
    msg.sender = msg.key.participant || msg.key.remoteJid
    msg.isBaileys = msg.id.startsWith('BAE5') && msg.id.length === 16

    // Push name fallback
    msg.pushName = msg.pushName || conn.getName(msg.sender) || 'Unknown'

    // Quoted message parsing
    if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        msg.quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage
        msg.quoted.sender = msg.message.extendedTextMessage.contextInfo.participant
        msg.quoted.id = msg.message.extendedTextMessage.contextInfo.stanzaId
    }

    // Enrich using utils
    return serialize(m)
      }
