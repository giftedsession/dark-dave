const axios = require("axios");

let handler = async (m, { text, client }) => {
  if (!text) return m.reply('❓ Provide a question.\n*Example:* .ai2 What is Node.js?');

  try {
    const { data } = await axios.get(`https://www.abella.icu/hika-ai?q=${encodeURIComponent(text)}`);
    const res = data.data;

    if (!res || !res.answer) return m.reply('⚠️ No answer received.');

    await m.reply(`🧠 *𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 AI Says:*\n\n${res.answer.trim()}`);

    if (res.references?.length) {
      const ref = res.references.map((v, i) => `${i + 1}. ${v.name}\n${v.url}`).join('\n\n');
      await m.reply(`📚 *References:*\n\n${ref}`);
    }
  } catch (err) {
    console.error('[AI2 ERROR]', err);
    m.reply('❌ Failed to fetch AI response.');
  }
};

handler.help = ['ai2'];
handler.tags = ['ai'];
handler.command = ['ai2'];

module.exports = handler;
