const axios = require('axios');

let handler = async (m, { text, command, conn }) => {
  if (!text) return m.reply(`*「 DEEP IMAGE GENERATOR 」*\n\nUse:\n${command} <prompt> | <style>\n\nExamples:\n${command} City at night | Cyberpunk\n${command} Beautiful fantasy forest | Fantasy\n\nOptional styles: realistic, anime, fantasy, cyberpunk...`);

  let [prompt, style] = text.split('|').map(a => a.trim());
  if (!prompt) return m.reply('❗ Please provide a prompt. Example:\n.deepimg Sunset over the mountains | fantasy');

  style = (style || 'realistic').toLowerCase();
  m.reply('⏳ Generating image, please wait...');

  const deviceId = `dev-${Math.floor(Math.random() * 1000000)}`;

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
    });

    const imageData = response.data?.data?.images?.[0];
    if (imageData?.url) {
      await conn.sendMessage(m.chat, {
        image: { url: imageData.url },
        caption: `✅ *Image Created!*\n\n*Prompt:* ${prompt}\n*Style:* ${style}`
      }, { quoted: m });
    } else {
      m.reply('❌ Failed to generate image.');
    }

  } catch (err) {
    console.error('[DEEPIMG ERROR]', err.response?.data || err.message);
    m.reply('❌ Error while generating image.');
  }
};

handler.help = ['deepimg'];
handler.tags = ['ai'];
handler.command = ['deepimg'];

module.exports = handler;
