const axios = require('axios');
const cheerio = require('cheerio');
let handler = async (m, { q, Gifted }) => {
  if (!q) return m.reply('Format invalid!\nExample: fancy Giddy Tennor');


  try {
    let res = await axios.get(`https://qaz.wtf/u/convert.cgi?text=${encodeURIComponent(q)}`);
    let $ = cheerio.load(res.data);
    let hasil = [];
    $('table > tbody > tr').each((i, el) => {
      let style = $(el).find('td').eq(0).text().trim();
      let text = $(el).find('td').eq(1).text().trim();
      if (style && text) {
        hasil.push(`*${style}:*\n${text}`);
      }
    });
    if (hasil.length === 0) return m.reply('invalid format.');
    let teks = `*Here is your fancy:* ${q}\n\n` + hasil.join('\n\n');
    m.reply(teks);
  } catch (e) {
    console.error(e);
    m.reply('error.');
  }
};   
handler.help = ['fancy']
handler.tags = ['ctext']
handler.command = ['fancy']


module.exports = handler;
