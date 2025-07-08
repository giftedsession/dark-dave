const axios = require('axios');

let handler = async (m, { Gifted }) => {
  await Gifted.sendMessage(m.chat, {
    text: `𝐃𝐀𝐕𝐄-𝐗𝐌𝐃

🔸 *Status:* Online ✅
🔸 *Developer:* Gifted Dave
🔸 *Mode:* ${Gifted.public ? "Public" : "Self"} 🔁`,
    contextInfo: {
      externalAdReply: {
        title: "𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 BOT",
        body: "Powered by Gifted Dave",
        thumbnailUrl: "https://files.catbox.moe/vr83h2.jpg",
        sourceUrl: "https://github.com/giftedsession/dark-dave",
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

handler.help = ['tes', 'bot', 'status'];
handler.tags = ['status'];
handler.command = ['tes', 'bot', 'status'];

module.exports = handler;
