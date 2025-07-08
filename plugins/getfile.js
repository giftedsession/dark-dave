const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, Owner, text, command }) => {
  if (!Owner) return m.reply(mess.owner);
  if (!text) return m.reply(`❗Example: .${command} Gifted.js`);

  let filePath = path.join(__dirname, text);

  if (!fs.existsSync(filePath)) return m.reply('❌ File not found.');

  try {
    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(filePath),
      fileName: path.basename(filePath),
      mimetype: 'text/plain'
    }, { quoted: m });
  } catch (e) {
    m.reply('❌ Failed to send file:\n' + (e?.message || e.toString()));
  }
};

handler.help = ['getfile'];
handler.tags = ['admin'];
handler.command = ['getfile'];

module.exports = handler;
