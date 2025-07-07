let handler = async (m, { conn, text, isOwner, quoted, mentionedJid }) => {
    if (!isOwner) return m.reply("❌ Only the owner can use this command.")
    if (!quoted && !mentionedJid.length && !text) return m.reply("❗ Tag, reply, or provide a number to block.")

    let target = mentionedJid[0]
              || (quoted ? quoted.sender : null)
              || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

    if (!target) return m.reply("🚫 Could not identify the user to block.")

    if (target === conn.decodeJid(conn.user.id)) return m.reply("😡 I can't block myself.")
    if (target === '254104260236@s.whatsapp.net') return m.reply("⚠️ I can't block my creator 😡")

    try {
        await conn.updateBlockStatus(target, 'block')
        m.reply(`✅ Successfully *blocked* @${target.split('@')[0]}`, { mentions: [target] })
    } catch (err) {
        m.reply("❌ Failed to block user.\n\n" + err)
    }
}

handler.help = ['block']
handler.tags = ['owner']
handler.command = ['block']
handler.owner = true

module.exports = handler
