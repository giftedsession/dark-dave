const axios = require('axios');
const yts = require('yt-search')
let handler = async (m, { text, Gifted,loli}) => {
  if (!text) return m.reply('Provide a title!\nExample: *play fade away*');

  try {
    const res = await fetch(`https://api.nekorinn.my.id/downloader/ytplay-savetube?q=${encodeURIComponent(text)}`);
    if (!res.ok) return m.reply('server error has occurred.');
    const data = await res.json();
    if (!data.status) return m.reply('invalid request!');
    const { title, channel, duration, imageUrl, link } = data.result.metadata;
    const downloadUrl = data.result.downloadUrl;
    await Gifted.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: true,
      contextInfo: {
        externalAdReply: {
          title,
          body: `${channel} • ${duration}`,
          mediaType: 2,
          thumbnailUrl: imageUrl,
          renderLargerThumbnail: false,
          sourceUrl: link,
          showAdAttribution: true
        }
      }
    }, { quoted: loli });
  } catch (e) {
    console.error(e);
    m.reply('an error has occurred while processing audio.');
  }
};
handler.help = ['song']
handler.tags = ['song']
handler.command = ['song']


module.exports = handler;
