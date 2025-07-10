
require('./settings')
const makeWASocket = require("@whiskeysockets/baileys").default
const { uncache, nocache } = require('./lib/loader')
const { color } = require('./lib/color')
const NodeCache = require("node-cache")
const readline = require("readline")
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const { Low, JSONFile } = require('./lib/lowdb')
const yargs = require('yargs/yargs')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const _ = require('lodash')
const { File } = require('megajs');
const moment = require('moment-timezone')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')

const {
  default: GiftedConnect,  // ✅ this line fixed
  getAggregateVotesInPollMessage,
  delay,
  PHONENUMBER_MCC,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto
} = require("@whiskeysockets/baileys")

const channelId = "120363400480173280@newsletter";

const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
})

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(new JSONFile(`src/database.json`))

global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(function () {
    (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null)
  }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read()
  global.db.READ = false
  global.db.data = {
    users: {},
    database: {},
    chats: {},
    game: {},
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = _.chain(global.db.data)
}
loadDatabase()

if (global.db) setInterval(async () => {
   if (global.db.data) await global.db.write()
}, 30 * 1000)

// ✅ These two lines are now correctly pointing to Gifted.js
require('./Gifted.js')
nocache('../Gifted.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))

// 🔁 It's okay to reload main.js too if needed:
require('./main.js')
nocache('../main.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))

let phoneNumber = "254104245659"
let owner = JSON.parse(fs.readFileSync('./src/data/role/owner.json'))

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

async function downloadSessionData() {
  try {
    await fs.promises.mkdir(sessionDir, { recursive: true });

    if (!fs.existsSync(credsPath)) {
      if (!global.SESSION_ID) {
        return console.log(color(`❌ Session ID not found at SESSION_ID!\n⚠️ creds.json also missing from session folder!\n\nPlease wait and enter your WhatsApp number...`, 'red'));
      }

      const base64Data = global.SESSION_ID.split("Gifted~")[1]; // ✅ fixed from Bellah~

      const sessionData = Buffer.from(base64Data, 'base64');
      await fs.promises.writeFile(credsPath, sessionData);

      console.log(color(`✅ Session successfully saved! Booting now...`, 'green'));
      await startGifted(); // ✅ changed from startBellah
    }
  } catch (error) {
    console.error('❌ Error downloading session data:', error);
  }
}


async function startGifted() { // ✅ function renamed
  let { version, isLatest } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState(`./session`)
  const msgRetryCounterCache = new NodeCache()

  const Gifted = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !pairingCode,
    mobile: useMobile,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid)
      let msg = await store.loadMessage(jid, key.id)
      return msg?.message || ""
    },
    msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined
  })

  store.bind(Gifted.ev)

  if (pairingCode && !Gifted.authState.creds.registered) {
    if (useMobile) throw new Error('❌ Cannot use pairing code with mobile API')

    let phoneNumber
    if (!!phoneNumber) {
      phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
      if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +254xxx"))
      )

       process.exit(0)
         }
      } else {
         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number \nFor example: +254xxx : `)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         // Ask again when entering the wrong number
         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +254xxx")))

            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number \nFor example: +254xxx : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            rl.close()
         }
      }

      setTimeout(async () => {
         let code = await Gifted.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }

Gifted.ev.on('connection.update', async (update) => {
        const {

                connection,
                lastDisconnect
        } = update
try{
                if (connection === 'close') {
                        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
                        if (reason === DisconnectReason.badSession) {
                                console.log(`Bad Session File, Please Delete Session and Scan Again`);
                                startGifted()
                        } else if (reason === DisconnectReason.connectionClosed) {
                                console.log("Connection closed, reconnecting....");
                                startGifted();
                        } else if (reason === DisconnectReason.connectionLost) {
                                console.log("Connection Lost from Server, reconnecting...");
                                startGifted();
                        } else if (reason === DisconnectReason.connectionReplaced) {
                                console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                                startGifted()
                        } else if (reason === DisconnectReason.loggedOut) {
                                console.log(`Device Logged Out, Please Delete Session and Scan Again.`);
                                startGifted();
                        } else if (reason === DisconnectReason.restartRequired) {
                                console.log("Restart Required, Restarting...");
                                startGifted();
                        } else if (reason === DisconnectReason.timedOut) {
                                console.log("Connection TimedOut, Reconnecting...");
                                startGifted();
                        } else Gifted.end(`Unknown DisconnectReason: ${reason}|${connection}`)
                }
                if (update.connection == "connecting" || update.receivedPendingNotifications == "false") {
                        console.log(color(`\nConnecting...`, 'white'))
                }
                if (update.connection == "open" || update.receivedPendingNotifications == "true") {
                        console.log(color(` `,'magenta'))
            console.log(color(`Connected to => ` + JSON.stringify(Gifted.user, null, 2), 'green'))
                        await delay(1999)
                        Gifted.sendMessage(Gifted.user.id, {
image: {
url: 'https://files.catbox.moe/vr83h2.jpg'
}, 
caption: `𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 connected
> Bot prefix: ${global.xprefix}

> Owner: ${global.ownernumber}

> BotName: ${global.botname}

> Total Command: 138

> Mode:  ${Gifted.public ? '𝗣𝘂𝗯𝗹𝗶𝗰 ϟ' : '𝗣𝗿𝗶𝘃𝗮𝘁𝗲 ϟ'}

*Follow support for updates*
https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k

*Join Group*

https://chat.whatsapp.com/LNkkXQ1rDv3GQNFFbqLoMe?mode=r_t


> Enjoy 😍`
})

  await Gifted.newsletterFollow(channelId);
      const CFonts = require('cfonts');
CFonts.say('𝐃𝐀𝐕𝐄-𝐗𝐌𝐃', {
  font: 'tiny',
  align: 'left',
  colors: ['blue', 'white'],
  background: 'transparent',
  letterSpacing: 1,
  lineHeight: 1,
  space: true,
  maxLength: '0',
});

console.log(color(`\n${global.themeemoji} YT CHANNEL: @davlodavlo19`,'magenta'))
console.log(color(`${global.themeemoji} GITHUB: https://github.com/giftedsession/dark-dave`,'magenta'))
console.log(color(`${global.themeemoji} WHATSAPP CHANNEL: https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k`,'magenta'))
console.log(color(`${global.themeemoji} CONTACT: wa.me/254104260236`,'magenta'))
console.log(color(`${global.themeemoji} BRAND: 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃\n`,'magenta'))
await delay(1000 * 2) 
await Gifted.groupAcceptInvite("https://chat.whatsapp.com/LNkkXQ1rDv3GQNFFbqLoMe?mode=r_t")

console.log('> Bot is Connected< [ ! ]')
                }

} catch (err) {
          console.log('Error in Connection.update ' + err)
          startGifted();
        }
})
Gifted.ev.on('creds.update', saveCreds)
Gifted.ev.on("messages.upsert",  () => { })

//------------------------------------------------------

//autostatus view
Gifted.ev.on('messages.upsert', async chatUpdate => {
  if (global.autostatusview){
    try {
        if (!chatUpdate.messages || chatUpdate.messages.length === 0) return;
        const mek = chatUpdate.messages[0];

        if (!mek.message) return;
        mek.message =
            Object.keys(mek.message)[0] === 'ephemeralMessage'
                ? mek.message.ephemeralMessage.message
                : mek.message;

        if (mek.key && mek.key.remoteJid === 'status@broadcast') {
            let emoji = [ "💙","❤️", "🌚","😍", "😭" ];
            let sigma = emoji[Math.floor(Math.random() * emoji.length)];
            await Gifted.readMessages([mek.key]);
            Gifted.sendMessage(
                'status@broadcast',
                { react: { text: sigma, key: mek.key } },
                { statusJidList: [mek.key.participant] },
            );
        }

    } catch (err) {
        console.error(err);
    }
  }
})


              //admin event
Gifted.ev.on('group-participants.update', async (anu) => {
    if (global.adminevent) {
        console.log(anu)
        try {
            let participants = anu.participants
            for (let num of participants) {
                try {
                    ppuser = await Gifted.profilePictureUrl(num, 'image')
                } catch (err) {
                    ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
                }
                try {
                    ppgroup = await Gifted.profilePictureUrl(anu.id, 'image')
                } catch (err) {
                    ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
                }

                if (anu.action == 'promote') {
                    const time = moment.tz('Africa/Nairobi').format('HH:mm:ss')
                    const date = moment.tz('Africa/Nairobi').format('DD/MM/YYYY')
                    let name = num
                    let body = `🎉 𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘂𝗹𝗮𝘁𝗶𝗼𝗻𝘀 @${name.split("@")[0]}! You have been *promoted* to *admin*!`
                    Gifted.sendMessage(anu.id, {
                        text: body,
                        contextInfo: {
                            mentionedJid: [num],
                            "externalAdReply": {
                                showAdAttribution: true,
                                containsAutoReply: true,
                                title: `${global.botname}`,
                                body: `${global.ownername}`,
                                previewType: "PHOTO",
                                thumbnailUrl: '',
                                thumbnail: '',
                                sourceUrl: `${global.wagc}`
                            }
                        }
                    })
                } else if (anu.action == 'demote') {
                    const time = moment.tz('Africa/Nairobi').format('HH:mm:ss')
                    const date = moment.tz('Africa/Nairobi').format('DD/MM/YYYY')
                    let name = num
                    let body = `⚠️ 𝗢𝗼𝗽𝘀 @${name.split("@")[0]}, you have been *demoted* from *admin*!`
                    Gifted.sendMessage(anu.id, {
                        text: body,
                        contextInfo: {
                            mentionedJid: [num],
                            "externalAdReply": {
                                showAdAttribution: true,
                                containsAutoReply: true,
                                title: `${global.botname}`,
                                body: `${global.ownername}`,
                                previewType: "PHOTO",
                                thumbnailUrl: '',
                                thumbnail: '',
                                sourceUrl: `${global.wagc}`
                            }
                        }
                    })
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
})

               // detect group update
Gifted.ev.on('messages.upsert', async chatUpdate => {
    try {
        mek = chatUpdate.messages[0]
        if (!mek.message) return
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        if (!Gifted.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
        if (mek.key.id.startsWith('Xeon') && mek.key.id.length === 16) return
        if (mek.key.id.startsWith('BAE5')) return
        m = smsg(Gifted, mek, store)
        require("./Gifted")(Gifted, m, chatUpdate, store)
    } catch (err) {
        console.log(err)
    }
})

Gifted.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {}
        return decode.user && decode.server && decode.user + '@' + decode.server || jid
    } else return jid
}

Gifted.ev.on('contacts.update', update => {
    for (let contact of update) {
        let id = Gifted.decodeJid(contact.id)
        if (store && store.contacts) store.contacts[id] = {
            id,
            name: contact.notify
        }
    }
})

Gifted.getName = (jid, withoutContact = false) => {
    id = Gifted.decodeJid(jid)
    withoutContact = Gifted.withoutContact || withoutContact
    let v
    if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
        v = store.contacts[id] || {}
        if (!(v.name || v.subject)) v = await Gifted.groupMetadata(id) || {}
        resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
    })
    else v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' }
        : id === Gifted.decodeJid(Gifted.user.id) ? Gifted.user
        : (store.contacts[id] || {})
    return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

Gifted.sendContact = async (jid, kon, quoted = '', opts = {}) => {
    let list = []
    for (let i of kon) {
        let name = await Gifted.getName(i)
        list.push({
            displayName: name,
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nitem1.TEL;waid=${i.split('@')[0]}:${i.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
        })
    }
    Gifted.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
}

Gifted.public = true

Gifted.serializeM = (m) => smsg(Gifted, m, store)

Gifted.sendText = (jid, text, quoted = '', options) => Gifted.sendMessage(jid, {
    text: text,
    ...options
}, {
    quoted,
    ...options
})

Gifted.sendImage = async (jid, path, caption = '', quoted = '', options) => {
    let buffer = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], 'base64')
        : /^https?:\/\//.test(path)
        ? await getBuffer(path)
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0)
    return await Gifted.sendMessage(jid, {
        image: buffer,
        caption: caption,
        ...options
    }, { quoted })
}

Gifted.sendTextWithMentions = async (jid, text, quoted, options = {}) => Gifted.sendMessage(jid, {
    text: text,
    mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
    ...options
}, { quoted })

Gifted.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], 'base64')
        : /^https?:\/\//.test(path)
        ? await getBuffer(path)
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0)
    let buffer = (options && (options.packname || options.author))
        ? await writeExifImg(buff, options)
        : await imageToWebp(buff)

    await Gifted.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
    fs.unlinkSync(buffer)
    return
}

Gifted.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], 'base64')
        : /^https?:\/\//.test(path)
        ? await getBuffer(path)
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0)

    let buffer = (options && (options.packname || options.author))
        ? await writeExifVid(buff, options)
        : await videoToWebp(buff)

    await Gifted.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
    return buffer
}
Gifted.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message
    let mime = (message.msg || message).mimetype || ''
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
    const stream = await downloadContentFromMessage(quoted, messageType)
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }
    let type = await FileType.fromBuffer(buffer)
    let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
    await fs.writeFileSync(trueFileName, buffer)
    return trueFileName
}

Gifted.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype
    if (options.readViewOnce) {
        message.message = message.message?.ephemeralMessage?.message || message.message
        vtype = Object.keys(message.message.viewOnceMessage.message)[0]
        delete message.message?.ignore
        delete message.message.viewOnceMessage.message[vtype].viewOnce
        message.message = { ...message.message.viewOnceMessage.message }
    }
    let mtype = Object.keys(message.message)[0]
    let content = await generateForwardMessageContent(message, forceForward)
    let ctype = Object.keys(content)[0]
    let context = {}
    if (mtype !== "conversation") context = message.message[mtype].contextInfo
    content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo
    }
    const waMessage = await generateWAMessageFromContent(jid, content, options ? {
        ...content[ctype],
        ...options,
        ...(options.contextInfo ? {
            contextInfo: {
                ...content[ctype].contextInfo,
                ...options.contextInfo
            }
        } : {})
    } : {})
    await Gifted.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
    return waMessage
}

Gifted.sendPoll = (jid, name = '', values = [], selectableCount = 1) => {
    return Gifted.sendMessage(jid, { poll: { name, values, selectableCount } })
}

Gifted.parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

Gifted.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || ''
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
    const stream = await downloadContentFromMessage(message, messageType)
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
}

return Gifted
}

async function tylor() {
    if (fs.existsSync(credsPath)) {
        console.log(color("Session file found, starting bot...", 'yellow'))
        await startGifted()
    } else {
        const sessionDownloaded = await downloadSessionData()
        if (sessionDownloaded) {
            console.log("Session downloaded, starting bot.")
            await startGifted()
        } else {
            if (!fs.existsSync(credsPath)) {
                if (!global.SESSION_ID) {
                    console.log(color("Please wait for a few seconds to enter your number!", 'red'))
                    await startGifted()
                }
            }
        }
    }
}

tylor()

process.on('uncaughtException', function (err) {
    let e = String(err)
    if (
        e.includes("conflict") ||
        e.includes("Socket connection timeout") ||
        e.includes("not-authorized") ||
        e.includes("already-exists") ||
        e.includes("rate-overlimit") ||
        e.includes("Connection Closed") ||
        e.includes("Timed Out") ||
        e.includes("Value not found")
    ) return
    console.log('Caught exception: ', err)
})
