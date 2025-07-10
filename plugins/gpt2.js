const axios = require('axios');
let handler = async (m, { text}) => {
if (!text) return m.reply('provide a query');

  try {
    let { data } = await axios.get(`https://www.abella.icu/aoyoai?q=${encodeURIComponent(text)}`);
    if (data?.status !== 'success') throw 'failed to create response';

    let res = data?.data?.response;
    if (!res) throw 'responding';

    m.reply(res);
  } catch (e) {
    m.reply('Yah Error');
  }
};
handler.help = ['gpt2']
handler.tags = ['chatgpt2']
handler.command = ['gpt2']


module.exports = handler;
