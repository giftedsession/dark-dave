const path = require('path')
const fs = require('fs')
let handler = async (m, {prefix, Gifted,command,text }) => {
    if (!text) return m.reply(`Example: ${prefix + command} https://example.com`);

    try {
        let res = await fetch(text);
        if (!res.ok) return m.reply('❌ invalid url');
        let html = await res.text();

        const filePath = path.join(__dirname, '../Temporary/html_dump.html');
        fs.writeFileSync(filePath, html);

        await Gifted.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            mimetype: 'text/html',
            fileName: 'source.html'
        }, { quoted: m });

        fs.unlinkSync(filePath); // hapus setelah terkirim
    } catch (e) {
        console.error(e);
        m.reply('❌ an error has occurred\n'+e.message);
    }
};
handler.help = ['getweb']
handler.tags = ['scweb']
handler.command = ['gethtml']


module.exports = handler;
