let handler = async (m, { client, participants, sender, isGroup }) => {
    const isOwner = global.owner?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender);

    if (!isGroup) return m.reply('❌ This command only works in groups.');
    if (!isOwner) return m.reply('🛡️ Only my *authorized owners* can make me leave.');

    const mentionList = participants.map(p => p.id);

    await client.sendMessage(m.chat, {
        text: '👋 *Goodbye everyone!*\nHope you enjoyed my stay.\n\n— Powered by 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃',
        mentions: mentionList
    }, { quoted: m });

    await client.groupLeave(m.chat);
};

handler.help = ['left'];
handler.tags = ['group'];
handler.command = ['left'];

module.exports = handler;
