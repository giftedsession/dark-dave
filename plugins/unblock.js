const axios = require('axios');
let handler = async (m, { Owner,text, Gifted,participants }) => {
  if (!isCreator) return m.reply("❌ *Only owners* can use this command.");

  let target = mentionedJid[0]
            || (quoted ? quoted.sender : null)
            || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

  if (!target) return m.reply("⚠️ Tag or reply to a user, or provide a number.");

  try {
    await Gifted.updateBlockStatus(target, 'unblock');
    m.reply(`✅ Successfully *unblocked* @${target.split('@')[0]}`, { mentions: [target] });
  } catch (e) {
    m.reply("❌ Failed to unblock user.\n\n" + e);
  }
};

handler.help = ['unblock']
handler.tags = ['owner']
handler.command = ['unblock', 'release']
handler.owner = true

module.exports = handler;
