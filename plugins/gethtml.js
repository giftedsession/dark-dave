const { modul } = require('../system/module')
const { fs, path, fetch } = modul

let handler = async (m, { prefix, Gifted, command, text }) => {
    if (!text) return m.reply(`Example: ${prefix + command} https://example.com`);

    try {
        let res = await fetch(text);
        if (!res.ok) return m.reply('❌ Invalid URL');
        let html = await res.text();

        const filePath = path.join(__dirname, '../Temporary/html_dump.html');
        fs.writeFileSync(filePath, html);

        await Gifted.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            mimetype: 'text/html',
            fileName: 'source.html'
        }, { quoted: m });

        fs.unlinkSync(filePath); // delete after sending
    } catch (e) {
        console.error(e);
        m.reply('❌ An error occurred:\n' + e.message);
    }
};

handler.help = ['getweb']
handler.tags = ['scweb']
handler.command = ['gethtml']

module.exports = handler
