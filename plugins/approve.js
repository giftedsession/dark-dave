let handler = async (m, { client, isAdmins, isBotAdmins, participants }) => {
    if (!m.isGroup) return m.reply('❌ This command only works in groups.');
    if (!isAdmins) return m.reply('🛑 Only *group admins* can use this.');
    if (!isBotAdmins) return m.reply('⚠️ I must be an *admin* to approve requests.');

    try {
        const pendingList = await client.groupRequestParticipantsList(m.chat);

        if (!pendingList || pendingList.length === 0)
            return m.reply("✅ No pending join requests to approve.");

        for (const person of pendingList) {
            await client.groupRequestParticipantsUpdate(
                m.chat,
                [person.jid],
                "approve"
            );
        }

        await m.reply(`✅ *𝐃𝐀𝐕𝐄-𝐗𝐌𝐃* has approved ${pendingList.length} pending requests.`);
    } catch (e) {
        console.error('APPROVE ERROR:', e);
        m.reply('❌ Failed to approve requests. Make sure the group has join-by-request enabled.');
    }
};

handler.help = ['approve'];
handler.tags = ['group'];
handler.command = ['approve'];

module.exports = handler;
