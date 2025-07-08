const axios = require('axios');

let handler = async (m, { text, command, conn }) => {
    const groupId = text.trim();

    if (!groupId.endsWith('@g.us')) {
        return m.reply(`❗ Provide a valid WhatsApp Group ID.\n\nExample:\n*${command} 120363123456789@g.us*`);
    }

    try {
        const inviteCode = await conn.groupInviteCode(groupId);
        const groupLink = `https://chat.whatsapp.com/${inviteCode}`;
        await m.reply(groupLink);
    } catch (e) {
        m.reply('❌ Failed to fetch group link. Make sure the group ID is valid and the bot is an admin in that group.');
    }
};

handler.help = ['ceklinkgc'];
handler.tags = ['group'];
handler.command = ['ceklinkgc'];

module.exports = handler;
