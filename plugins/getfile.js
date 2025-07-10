const fs = require("fs")

let handler = async (m, { Gifted,Owner, reply, text, example }) => {
 if (!Owner) return m.reply(mess.owner)
 if (!text) return m.reply('Example: .getfile Gifted.js')

 const fs = require('fs')
 const path = require('path')

 let filePath = path.join(__dirname, text)

 // cek apakah file ada
 if (!fs.existsSync(filePath)) return m.reply('File does not exist, bro.')


 try {
 await Gifted.sendMessage(m.chat, {
 document: fs.readFileSync(filePath),
 fileName: text,
 mimetype: 'text/plain'
 }, { quoted: m })
 } catch (e) {
 m.reply('failed to get file:\n' + e?.message || e.toString())
 }
};
handler.help = ['getfile']
handler.tags = ['get']
handler.command = ['getfile']


module.exports = handler;
