const fs = require('fs')
const chalk = require('chalk')

if (fs.existsSync('.env')) require('dotenv').config({ path: __dirname + '/.env' })

// ✅ Core Session ID
global.SESSION_ID = process.env.SESSION_ID || 'Gifted~generated-session-id'

// 📱 Identity & Branding
global.ytname = 'YT: GiftedDaves'
global.socialm = 'IG: @gifteddaves'
global.location = 'Kenya'

global.botname = process.env.BOT_NAME || '𝐃𝐀𝐕𝐄-𝐗𝐌𝐃'
global.ownernumber = process.env.OWNER_NUMBER || '254104260236'
global.ownername = '© gifteddaves'
global.websitex = 'https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k'
global.wagc = 'https://chat.whatsapp.com/LNkkXQ1rDv3GQNFFbqLoMe?mode=r_t'
global.themeemoji = '🧠'
global.wm = '𝐃𝐀𝐕𝐄-𝐗𝐌𝐃'
global.botscript = 'https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k'
global.packname = process.env.PACK_NAME || '𝐃𝐀𝐕𝐄-𝐗𝐌𝐃'
global.author = 'gifteddaves'
global.creator = '254104260236@s.whatsapp.net'
global.xprefix = process.env.BOT_PREFIX || '.'
global.hituet = 0

// ⚙️ Bot Behavior Settings
global.autoblocknumber = process.env.AUTOBLOCK_NUMBER || '263,234'
global.antiforeignnumber = process.env.ANTIFOREIGN_NUMBER || ''
global.mode = process.env.MODE || 'public'
global.anticall = process.env.ANTI_CALL || 'false'
global.autostatusview = process.env.AUTOSW_VIEW || 'true'
global.adminevent = true
global.groupevent = process.env.GROUP_EVENT || 'true'

// 💬 Messages
const appname = process.env.APP_NAME || ''
const herokuapi = process.env.HEROKU_API

global.mess = {
    limit: '🧠 Your limit is up!',
    nsfw: '🔞 NSFW is disabled in this group!',
    owner: '👑 This command is for owner only.',
    admin: '🔐 You must be a group admin to use this!',
    group: '👥 This feature only works in group chats.',
    done: '✅ Done.',
    error: '❌ An error occurred!',
    success: '✅ Success!'
}

// 🔁 Auto Reload
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Settings updated: '${__filename}'`))
    delete require.cache[file]
    require(file)
})
