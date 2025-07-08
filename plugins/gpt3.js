const axios = require('axios');

let handler = async (m, { text }) => {
  if (!text) return m.reply('💬 Please enter a prompt.\n\nExample: *.gpt3 Who is Messi?*');

  try {
    let { data } = await axios.get(`https://www.abella.icu/alenaai?q=${encodeURIComponent(text)}`);

    if (data?.data?.answer) {
      m.reply(data.data.answer);
    } else {
      m.reply('⚠️ Couldn\'t fetch a response. Try again later.');
    }
  } catch (e) {
    console.error(e);
    m.reply('❌ Error connecting to GPT API.');
  }
};

handler.help = ['gpt3'];
handler.tags = ['ai'];
handler.command = ['gpt3'];

module.exports = handler;
