let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply("❌ This command only works in group chats.");

  function convertTimestamp(timestamp) {
    const d = new Date(timestamp * 1000);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      date: d.getDate(),
      month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d),
      year: d.getFullYear(),
      day: daysOfWeek[d.getUTCDay()],
      time: `${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}`
    }
  }

  const info = await conn.groupMetadata(m.chat)
  const ts = convertTimestamp(info.creation)

  let pp
  try {
    pp = await conn.profilePictureUrl(m.chat, 'image')
  } catch {
    pp = 'https://img1.pixhost.to/images/5480/594774540_skyzopedia.jpg'
  }

  const admins = info.participants.filter(p => p.admin !== null)
  const members = info.participants.length - admins.length

  let caption = `
*🏷️ Group Name:* ${info.subject}
*🆔 ID:* ${info.id}
*👑 Group Owner:* @${info.owner?.split('@')[0] || 'No Owner'}

*📅 Created:* ${ts.day}, ${ts.date} ${ts.month} ${ts.year}, ${ts.time}
*👥 Total Members:* ${info.size}
 ├ 🧍‍♂️ Members: ${members}
 └ 🛡️ Admins: ${admins.length}

*💬 Message Permissions:* ${info.announce ? 'Admins Only' : 'Everyone'}
*✏️ Info Edit Rights:* ${info.restrict ? 'Admins Only' : 'Everyone'}
*➕ Add Participants:* ${info.memberAddMode === true ? 'Everyone' : 'Admins'}
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: caption,
    mentions: [info.owner]
  }, { quoted: m })
}

handler.help = ['gcinfo']
handler.tags = ['group']
handler.command = ['gcinfo', 'gcinformation']

module.exports = handler
