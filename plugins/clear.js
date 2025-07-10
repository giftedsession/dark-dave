const axios = require('axios');
let handler = async (m, { Owner,text, Gifted }) => {
if (!Owner) return m.reply(`Syntax Error!!
</> No Acces`)
Gifted.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.timestamp }]}, m.chat)
}; 
handler.help = ['clear']
handler.tags = ['clearchat']
handler.command = ['clear']


module.exports=handler;
