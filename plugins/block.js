let handler = async (m, { conn, text, isOwner }) => {
    if (!isOwner) return m.reply("❌ Only the owner can use this command.")
    if (!m.quoted && !text) return m.reply("❗ Tag or reply to the user you want to block.")

    let user = m.mentionedJid?.[0] 
        || m.quoted?.sender 
        || (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net')

    if (!user) return m.reply("🚫 Invalid user.")
    if (user === '254104260236@s.whatsapp.net') return m.reply("⚠️ I can't block my creator 😡")
    if (user === conn.decodeJid(conn.user.id)) return m.reply("😡 I won't block myself, fool.")

    await conn.updateBlockStatus(user, 'block')
    m.reply(`✅ Successfully blocked: ${user}`)
}

handler.help = ['block']
handler.tags = ['admin']
handler.command = ['block']

module.exports = handler
