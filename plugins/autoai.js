const axios = require('axios');
let handler = async (m, { Gifted, text }) => {
    Gifted.autoAI = Gifted.autoAI ?? false
    Gifted.autoAISession = Gifted.autoAISession ?? null

    if (!text) return m.reply(" `.autoai on or off`")

    if (text === 'on') {
        if (Gifted.autoAI && Gifted.autoAISession) return
        try {
            let role = `my name is 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 Al how can i assist you today .` // ubah aja serah lu
            let createRes = await axios.get(`https://zenzxz.dpdns.org/ai/chatai/create`, {
                params: { role: role }
            })
            if (createRes.data && createRes.data.success && createRes.data.sessionId) {
                Gifted.autoAI = true
                Gifted.autoAISession = createRes.data.sessionId
                m.reply('Auto AI is activated')
            } else {
                m.reply(JSON.stringify(createRes.data))
            }
        } catch (e) {
            let err = e.response ? e.response.data : e
            m.reply(typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err))
        }
    } else if (text === 'off') {
        if (! Gifted.autoAI || ! Gifted.autoAISession) return
        try {
            await axios.get(`https://zenzxz.dpdns.org/ai/chatai/delete`, {
                params: { sessionId: conn.autoAISession }
            })
            Gifted.autoAI = false
            Gifted.autoAISession = null
            m.reply('Auto AI is de activated')
        } catch (e) {
            let err = e.response ? e.response.data : e
            m.reply(typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err))
        }
    } else {
        m.reply('use .autoai on or.autoai off')
    }
}

handler.before = async (m, { Gifted }) => {
    if (m.isBaileys && m.fromMe) return
    if (!m.text) return
    if (! Gifted.autoAI || ! Gifted.autoAISession) return
    if (/^[.\#!\/\\]/.test(m.text)) return

    try {
        let chatRes = await axios.get(`https://zenzxz.dpdns.org/ai/chatai/chat`, {
            params: {
                sessionId: Gifted.autoAISession,
                text: m.text
            }
        })

        if (chatRes.data && chatRes.data.result) {
            m.reply(chatRes.data.result)
        } else {
            m.reply(JSON.stringify(chatRes.data))
        }
    } catch (e) {
        let err = e.response ? e.response.data : e
        m.reply(typeof err === 'object' ? JSON.stringify(err, null, 2) : String(err))
    }
};

handler.command = ['autoai']
handler.tags = ['ai']
handler.help = ['autoai on/off']

module.exports = handler;
