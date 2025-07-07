const fs = require("fs");

let handler = async (m, { client, participants }) => {
    if (!m.isGroup) return m.reply("❌ This command only works in groups.");

    const metadata = await client.groupMetadata(m.chat);
    const members = participants.map(p => p.id);

    let vcard = '';
    let count = 1;

    for (let user of metadata.participants) {
        const number = user.id.split('@')[0];
        vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${count++}] +${number}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD\n`;
    }

    const filePath = './contacts.vcf';
    fs.writeFileSync(filePath, vcard.trim());

    await m.reply(`📇 Exporting ${metadata.participants.length} contacts...`);

    await client.sendMessage(m.chat, {
        document: fs.readFileSync(filePath),
        mimetype: 'text/vcard',
        fileName: `𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 Group Contacts.vcf`,
        caption: `📎 *VCF for:* ${metadata.subject}\n👥 Total: ${metadata.participants.length} contacts`
    }, { quoted: m, ephemeralExpiration: 86400 });

    fs.unlinkSync(filePath);
};

handler.help = ['vcf'];
handler.tags = ['group'];
handler.command = ['vcf'];

module.exports = handler;
