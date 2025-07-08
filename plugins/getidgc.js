let handler = async (m, { Gifted }) => {
    if (!m.isGroup) return m.reply('❌ This command only works in group chats.')

    let groupId = `${m.chat}`
    await Gifted.relayMessage(m.chat, {
        requestPaymentMessage: {
            currencyCodeIso4217: 'USD', // Use 'XXX' if you want a neutral/unknown currency
            amount1000: 1000000000,
            requestFrom: m.sender,
            noteMessage: {
                extendedTextMessage: {
                    text: groupId,
                    contextInfo: {
                        externalAdReply: {
                            showAdAttribution: true
                        }
                    }
                }
            }
        }
    }, {})
}

handler.help = ['groupid']
handler.tags = ['gcid']
handler.command = ['getidgc']

module.exports = handler
