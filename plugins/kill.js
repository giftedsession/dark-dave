let handler = async (m, { client, participants, isBotAdmins, isGroup, sender }) => {
    const OWNER = ['254104260236@s.whatsapp.net']; // Replace with your full owner JID
    const isOwner = OWNER.includes(sender);

    if (!isGroup) return m.reply('❌ This command only works in groups.');
    if (!isOwner) return m.reply('🛡️ Only my owner can use this command.');
    if (!isBotAdmins) return m.reply('⚠️ I must be *admin* to execute kill mode.');

    const allMembers = participants
        .filter(p => p.id !== client.decodeJid(client.user.id))
        .map(p => p.id);

    await m.reply('💣 Initializing group kill sequence...');

    try {
        await client.removeProfilePicture(m.chat);
        await client.groupUpdateSubject(m.chat, "💀 Group Terminated by 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃");
        await client.groupUpdateDescription(m.chat, "⚠️ This group has been dissolved. All members will be removed shortly.");

        setTimeout(async () => {
            await client.sendMessage(m.chat, {
                text: `⚠️ All parameters are confirmed.\n\nKicking ${allMembers.length} members... 😈\n\nThis action is *IRREVERSIBLE*.`
            }, { quoted: m });

            setTimeout(async () => {
                await client.groupParticipantsUpdate(m.chat, allMembers, 'remove');

                setTimeout(async () => {
                    await m.reply("✅ All participants removed.\n👋 Leaving group...");
                    await client.groupLeave(m.chat);
                }, 1000);
            }, 1000);
        }, 1000);
    } catch (err) {
        console.error('KILL ERROR:', err);
        m.reply('❌ Something went wrong executing the kill command.');
    }
};

handler.help = ['kill'];
handler.tags = ['group'];
handler.command = ['kill'];

module.exports = handler;
