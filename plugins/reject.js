let handler = async (m, { client, isAdmins, isBotAdmins, isGroup }) => {
    if (!isGroup) return m.reply('❌ This command only works in groups.');
    if (!isAdmins) return m.reply('🚫 Only *group admins* can use this.');
    if (!isBotAdmins) return m.reply('⚠️ I need to be *admin* to reject join requests.');

    try {
        const pendingList = await client.groupRequestParticipantsList(m.chat);
        if (!pendingList || pendingList.length === 0) return m.reply('📭 No pending join requests found.');

        for (const user of pendingList) {
            await client.groupRequestParticipantsUpdate(
                m.chat,
                [user.jid],
                'reject'
            );
        }

        m.reply(`❌ All pending join requests have been rejected.`);
    } catch (err) {
        console.error('[REJECT ERROR]', err);
        m.reply('❌ Failed to reject join requests.');
    }
};

handler.help = ['reject'];
handler.tags = ['group'];
handler.command = ['reject'];

module.exports = handler;
