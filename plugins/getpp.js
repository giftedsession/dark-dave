const axios = require("axios");
const googleTTS = require('google-tts-api');

let handler = async (m, { Owner, Gifted, q }) => {

  if (!Owner) return m.reply('❌ Only the owner can use this command.')

  let target;

  // If mentioned
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    target = m.mentionedJid[0]
  }
  // If replied
  else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender
  }
  // If manually entered
  else if (q) {
    const number = q.replace(/[^0-9]/g, '')
    target = number + '@s.whatsapp.net'
  } else {
    return m.reply('💡 Example: .getpp 254xxx or .getpp @tag')
  }

  try {
    const pp = await Gifted.profilePictureUrl(target, 'image').catch(() => null)
    if (!pp) return m.reply('🔒 Profile picture is hidden or private.')
    await Gifted.sendMessage(m.chat, {
      image: { url: pp },
      caption: `✅ Profile picture fetched for: *${target.split('@')[0]}*`
    }, { quoted: m })
  } catch (err) {
    console.error(err)
    m.reply('❌ An unexpected error occurred.')
  }
}

handler.help = ['getpp']
handler.tags = ['dp']
handler.command = ['getpp']

module.exports = handler
