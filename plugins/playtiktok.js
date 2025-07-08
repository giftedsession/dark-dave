const axios = require('axios');

let handler = async (m, { q, Gifted }) => {
  if (!q) return m.reply('📌 Provide a query!\n\nExample: *.playtiktok haikyuu edit*');

  let res = await fetch(`https://apizell.web.id/download/tiktokplay?q=${encodeURIComponent(q)}`);
  let json = await res.json();

  if (!json.status || !json.data || !json.data.length) return m.reply('❌ Video not found.');

  let vid = json.data[0];
  let caption = `*🎬 Title:* ${vid.title}
*👤 Author:* ${vid.author}
*👁️ Views:* ${vid.views.toLocaleString()}
*📝 Description:* ${vid.desc || '-'}
`;

  await Gifted.sendMessage(m.chat, {
    video: { url: vid.url },
    caption,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        title: vid.title,
        body: `By ${vid.author} • ${vid.views.toLocaleString()} views`,
        mediaType: 1,
        thumbnailUrl: vid.thumbnail,
        mediaUrl: vid.url,
        sourceUrl: vid.url
      }
    }
  }, { quoted: m });
};

handler.help = ['playtiktok'];
handler.tags = ['tiktok'];
handler.command = ['playtiktok'];

module.exports = handler;
