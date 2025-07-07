const axios = require('axios');
const fs = require('fs');
const path = require('path');

let handler = async (m, { text, sender }) => {
    const isOwner = global.owner?.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender);
    if (!isOwner) return m.reply('🛡️ Only owners can use .plug');
    if (!text || !text.startsWith('http')) return m.reply('🌐 Use format:\n.plug <raw plugin URL>');

    try {
        const res = await axios.get(text);
        const code = res.data;

        if (!code.includes('handler') || !code.includes('module.exports'))
            return m.reply('❌ Plugin must contain `handler` and `module.exports`.');

        const fileName = `plug-${Date.now()}.js`;
        const savePath = path.join(__dirname, fileName);
        fs.writeFileSync(savePath, code);

        m.reply(`✅ Plugin saved as: *${fileName}*\nUse .reload to activate it without restarting.`);
    } catch (err) {
        console.error('[PLUG ERROR]', err);
        m.reply('❌ Failed to plug. Make sure the URL is valid.');
    }
};

handler.help = ['plug'];
handler.tags = ['plugins'];
handler.command = ['plug'];

module.exports = handler;
