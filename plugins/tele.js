const axios = require('axios');
let handler = async (m, {command,q,prefix,loli, Gifted }) => {
  if (!q) return m.reply(`Use!\nExample: ${prefix + command} tennormodzcoder`)
  try {
    const res = await fetch(`https://www.velyn.biz.id/api/stalk/telegramstalk?username=${q}`)
    const json = await res.json()
    if (!json.status) return m.reply('Username is invalid!')
    const { title, description, url, image_url } = json.data
    const teks = `*Telegram Info*\n\n*Name:* ${title}\n*Bio:* ${description}\n*Link:* ${url}`
    Gifted.sendMessage(m.chat, {
      image: { url: image_url },
      caption: teks
    }, { quoted: loli })
  } catch {
    m.reply('failed to get data.')
  }
}; 

handler.help = ['telegram']
handler.tags = ['telestalk']
handler.command = ['telestalk']


module.exports=handler;
