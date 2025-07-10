const fs = require("fs");
let handler = async (m, { Owner,text, Gifted,participants }) => {
if (!m.isGroup) return m.reply("Command meant for groups");


let gcdata = await Gifted.groupMetadata(m.chat)
let gcmem = participants.map(a => a.id)

let vcard = ''
let noPort = 0

for (let a of gcdata.participants) {
    vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${noPort++}] +${a.id.split("@")[0]}\nTEL;type=CELL;type=VOICE;waid=${a.id.split("@")[0]}:+${a.id.split("@")[0]}\nEND:VCARD\n`
}

let cont = './contacts.vcf'

await m.reply('Getting Vcf contacts '+gcdata.participants.length+' in process...');
await fs.writeFileSync(cont, vcard.trim())
await Gifted.sendMessage(m.chat, {
    document: fs.readFileSync(cont), mimetype: 'text/vcard', fileName: 'Group contacts.vcf', caption: 'VCF for '+gcdata.subject+'\n'+gcdata.participants.length+' contacts'
}, {ephemeralExpiration: 86400, quoted: m})
fs.unlinkSync(cont)

};

handler.help = ['fetch']
handler.tags = ['contacts']
handler.command = ['vcf']


module.exports = handler;
