const googleTTS = require('google-tts-api');

let handler = async (m, { text, client }) => {
    if (!text) return m.reply('🗣️ Provide some text to convert.\nExample: .say hello I am Dave.');

    try {
        const url = googleTTS.getAudioUrl(text, {
            lang: 'en',         // Change to 'hi-IN', 'sw', etc. if needed
            slow: false,
            host: 'https://translate.google.com',
        });

        await client.sendMessage(m.chat, {
            audio: { url },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: m });

    } catch (e) {
        console.error('[TTS ERROR]', e);
        m.reply('❌ Failed to generate voice. Try again later.');
    }
};

handler.help = ['tts'];
handler.tags = ['voice'];
handler.command = ['tts', 'say'];

module.exports = handler;
