const axios = require('axios');
let handler = async (m, { Owner,text, Gifted }) => {
 if (!Owner) return m.reply(mess.owner)
 if (!m.quoted) return m.reply("tag someone") 
 let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
         if (users == "254104260236@s.whatsapp.net") return m.reply("𝗜 𝗰𝗮𝗻𝗻𝗼𝘁 𝗯𝗹𝗼𝗰𝗸 𝗺𝘆 𝗢𝘄𝗻𝗲𝗿 😡");
                  if (users  == Gifted.decodeJid(Gifted.user.id)) throw '𝗜 𝗰𝗮𝗻𝗻𝗼𝘁 𝗯𝗹𝗼𝗰𝗸 𝗺𝘆𝘀𝗲𝗹𝗳 𝗶𝗱𝗶𝗼𝘁 😡';
 await Gifted.updateBlockStatus(users, 'block'); 
 m.reply (`𝗕𝗹𝗼𝗰𝗸𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝗳𝘂𝗹𝗹𝘆!`); 
 }; 
handler.help = ['restrict']
handler.tags = ['ban']
handler.command = ['block']


module.exports = handler;
