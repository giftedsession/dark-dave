const axios = require('axios');
let handler = async (m, { Owner,text, Gifted,participants,isBotAdmins }) => {

if (!m.isGroup) return m.reply(mess.group)
          if (!Owner) return m.reply(mess.owner)
 if (!isBotAdmins) return m.reply(`bot is not admin in the group`)
          let raveni = participants.filter(_0x5202af => _0x5202af.id != Bellah.decodeJid(Bellah.user.id)).map(_0x3c0c18 => _0x3c0c18.id);

          m.reply("Initializing Kill command💀...");

      await Gifted.removeProfilePicture(m.chat);
      await Gifted.groupUpdateSubject(m.chat, "𝐃𝐀𝐕𝐄-𝐗𝐌𝐃");
      await Gifted.groupUpdateDescription(m.chat, "//This group is no longer available 🥹!");


          setTimeout(() => {
            Gifted.sendMessage(m.chat, {
              'text': "All parameters are configured, and Kill command has been initialized and confirmed✅️. Now, all " + raveni.length + " group participants will be removed in the next second.\n\nGoodbye Everyone 👋\n\nTHIS PROCESS IS IRREVERSIBLE ⚠️"
            }, {
              'quoted': m
            });
            setTimeout(() => {
              Gifted.groupParticipantsUpdate(m.chat, raveni, "remove");
              setTimeout(() => {
                m.reply("Succesfully removed All group participants✅️.\n\nGoodbye group owner 👋, its too cold in here 🥶.");
Gifted.groupLeave(m.chat);              
              }, 1000);
            }, 1000);
          }, 1000);
        };
handler.help = ['removeall']
handler.tags = ['killall']
handler.command = ['kill']


module.exports = handler;
