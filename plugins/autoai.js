const axios = require('axios');

let handler = async (m, { conn, text }) => {
    conn.autoAI = conn.autoAI ?? false
    conn.autoAISession = conn.autoAISession ?? null

    if (!text) return m.reply('Use `.autoai on` or `.autoai off`')

    if (text === 'on') {
        if (conn.autoAI && conn.autoAISession) return m.reply('AI is already active.')
        try {
            let role = `My name is 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 AI Assistant. How can I help you today?`
            let createRes = await axios.get('https://zenzxz.dpdns.org/ai/chatai/create', {
                params: { role }
            })

            if (createRes.data?.success && createRes.data.sessionId) {
                conn.autoAI = true
                conn.autoAISession = createRes.data.sessionId
                m.reply('✅ Auto AI activated.')
            } else {
                m.reply(`❌ Failed: ${JSON.stringify(createRes.data)}`)
            }
        } catch (e) {
            let err = e.response?.data || e
            m.reply(typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err))
        }
    } else if (text === 'off') {
        if (!conn.autoAI || !conn.autoAISession) return m.reply('AI is already inactive.')
        try {
            await axios.get('https://zenzxz.dpdns.org/ai/chatai/delete', {
                params: { sessionId: conn.autoAISession }
            })
            conn.autoAI = false
            conn.autoAISession = null
            m.reply('🛑 Auto AI deactivated.')
        } catch (e) {
            let err = e.response?.data || e
            m.reply(typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err))
        }
    } else {
        m.reply('Use `.autoai on` or `.autoai off` only')
    }
}

handler.before = async (m, { conn }) => {
    if (m.isBaileys || m.fromMe || !m.text) return
    if (!conn.autoAI || !conn.autoAISession) return
    if (/^[.\#!\/\\]/.test(m.text)) return

    try {
        let chatRes = await axios.get('https://zenzxz.dpdns.org/ai/chatai/chat', {
            params: {
                sessionId: conn.autoAISession,
                text: m.text
            }
        })

        if (chatRes.data?.result) {
            m.reply(chatRes.data.result)
        } else {
            m.reply(JSON.stringify(chatRes.data))
        }
    } catch (e) {
        let err = e.response?.data || e
        m.reply(typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err))
    }
}

handler.command = ['autoai']
handler.tags = ['ai']
handler.help = ['autoai on/off']

module.exports = handler
