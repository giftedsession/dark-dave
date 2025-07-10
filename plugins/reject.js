const axios = require('axios');
let handler = async (m, { Owner,text, Gifted,participants,isAdmins,isBotAdmins }) => {
if (!m.isGroup) return m.reply(mess.group)
if (!isAdmins) return m.reply("this feature is only for group admins")
if (!isBotAdmins) return m.reply("bot must be admin idiot")

const responseList = await Gifted.groupRequestParticipantsList(m.chat);

if (responseList.length === 0) return m.reply("no pending requests detected");

for (const participan of responseList) {
    const response = await Gifted.groupRequestParticipantsUpdate(
        m.chat, 
        [participan.jid], // Approve/reject each participant individually
        "reject" // or "reject"
    );
    console.log(response);
}
m.reply("pending requests have been rejected!");

} ;

handler.help = ['reject']
handler.tags = ['reject']
handler.command = ['reject']


module.exports = handler;
