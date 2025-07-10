const axios = require('axios');
let handler = async (m, { Owner,text, Gifted,participants }) => {

if (!Owner) return m.reply (mess.owner)
                 if (!m.isGroup) return m.reply(mess.group)
 await Gifted.sendMessage(m.chat, { text : '𝗚𝗼𝗼𝗱𝗯𝘆𝗲 𝗲𝘃𝗲𝗿𝘆𝗼𝗻𝗲👋. Hope you enjoyed my stay here...' , mentions: participants.map(a => a.id)}, { quoted : m }); 
                 await Gifted.groupLeave(m.chat); 

             } ;

handler.help = ['leave']
handler.tags = ['leavegc']
handler.command = ['left']


module.exports = handler;
