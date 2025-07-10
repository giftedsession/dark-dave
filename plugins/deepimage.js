const axios = require('axios');
let handler = async (m, { text, Gifted}) => {
  if (!text) return m.reply(`*「 DEEP IMAGE GENERATOR 」*

Use:
.deepimg <prompt> | <style>

Use:
.deepimg City at night | Cyberpunk
.deepimg Beautiful fantasy forest | Fantasy

Example style:
.deepimg Sunset over the mountains
`)

  let [prompt, style] = text.split('|').map(a => a.trim())
  if (!prompt) return m.reply('Provide a query! Example: .deepimg City | Cyberpunk')

  style = (style || 'realistic').toLowerCase()

  m.reply('⏳ Sending image...')

  const deviceId = `dev-${Math.floor(Math.random() * 1000000)}`
  try {
    const response = await axios.post('https://api-preview.chatgot.io/api/v1/deepimg/flux-1-dev', {
      prompt: `${prompt} -style ${style}`,
      size: "1024x1024",
      device_id: deviceId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://deepimg.ai',
        'Referer': 'https://deepimg.ai/',
      }
    })

    const data = response.data
    if (data?.data?.images?.length > 0) {
      const imageUrl = data.data.images[0].url
      await Gifted.sendMessage(m.chat, { image: { url: imageUrl }, caption: `✅ Succes Create image!\n\n*Prompt:* ${prompt}\n*Style:* ${style}` }, { quoted: m })
    } else {
      m.reply('❌ error.')
    }
  } catch (err) {
    console.error(err.response ? err.response.data : err.message)
    m.reply('❌ error.')
  }
};  
handler.help = ['deepimage']
handler.tags = ['deepphoto']
handler.command = ['deepimg']


module.exports = handler;
