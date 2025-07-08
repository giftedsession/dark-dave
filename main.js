
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
const { default: GiftedConnect, getAggregateVotesInPollMessage, delay, PHONENUMBER_MCC, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require("@whiskeysockets/baileys")

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
  if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
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

require('./Gifted.js')
nocache('./Gifted.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))
require('./main.js')
nocache('./main.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))
//------------------------------------------------------
  let phoneNumber = "254104260236"
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
        return console.log(color(`Session ID not found in SESSION_ID!\ncreds.json not found in session folder!\n\nPlease enter your number`, 'red'));
      }

      const base64Data = global.SESSION_ID.split("Dave~")[1]; // <-- DAVE STYLE PAIRING
      const sessionData = Buffer.from(base64Data, 'base64');

      await fs.promises.writeFile(credsPath, sessionData);
      console.log(color(`Session successfully saved! Booting up...`, 'green'));
      await startGifted();
    }
  } catch (error) {
    console.error('Error downloading session data:', error);
  }
}

async function startGifted() {
  let { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState(`./session`)
  const msgRetryCounterCache = new NodeCache()

  const Gifted = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !pairingCode,
    mobile: useMobile,
    browser: [ "Ubuntu", "Chrome", "20.0.04" ],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    msgRetryCounterCache,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid)
      let msg = await store.loadMessage(jid, key.id)
      return msg?.message || ""
    }
  })

  store.bind(Gifted.ev)

  if (pairingCode && !Gifted.authState.creds.registered) {
    if (useMobile) throw new Error('Pairing code not supported on mobile API')

    let number = phoneNumber.replace(/[^0-9]/g, '')
    if (!Object.keys(PHONENUMBER_MCC).some(v => number.startsWith(v))) {
      console.log(chalk.redBright("Start with country code e.g. +254..."))
      process.exit(0)
    }

    setTimeout(async () => {
      let code = await Gifted.requestPairingCode(number)
      code = code?.match(/.{1,4}/g)?.join("-") || code
      console.log(chalk.greenBright(`🔗 Your Pairing Code:`), chalk.white(code))
    }, 3000)
  }

  Gifted.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    try {
      if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
        switch (reason) {
          case DisconnectReason.badSession:
            console.log("Bad Session. Delete session and pair again.")
            break
          case DisconnectReason.connectionClosed:
          case DisconnectReason.connectionLost:
          case DisconnectReason.restartRequired:
          case DisconnectReason.timedOut:
            console.log("Reconnecting...")
            break
          case DisconnectReason.connectionReplaced:
            console.log("Session replaced. Close other sessions.")
            break
          case DisconnectReason.loggedOut:
            console.log("Logged out. Delete session and scan again.")
            break
          default:
            Gifted.end(`Disconnected: ${reason}`)
            break
        }
        startGifted()
      }

      if (connection === "connecting") {
        console.log(color(`Connecting...`, 'cyan'))
      }

      if (connection === "open") {
        console.log(color(`✅ Connected as => ${JSON.stringify(Gifted.user, null, 2)}`, 'green'))
        await delay(1500)
        Gifted.sendMessage(Gifted.user.id, {
          image: { url: 'https://files.catbox.moe/vr83h2.jpg' },
          caption: `𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 Connected ✅

> Prefix: ${global.xprefix}
> Owner: ${global.ownernumber}
> Bot Name: ${global.botname}
> Mode: ${Gifted.public ? '𝗣𝘂𝗯𝗹𝗶𝗰' : '𝗣𝗿𝗶𝘃𝗮𝘁𝗲'}

📣 Newsletter:
https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k

👥 Group:
https://chat.whatsapp.com/FCwOCmmS3unCOA5w0ehWfC?mode=r_t
        })

        await Gifted.newsletterFollow(channelId);
        console.log('> 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 is ready! [✔]')
      }
    } catch (err) {
      console.error('❌ Connection error:', err)
      startGifted()
    }
  })
`
  Gifted.ev.on('creds.update', saveCreds)
  Gifted.ev.on("messages.upsert", () => {})

  // Autostatus view
  Gifted.ev.on('messages.upsert', async chatUpdate => {
    if (global.autostatusview) {
      try {
        if (!chatUpdate.messages || chatUpdate.messages.length === 0) return;
        const mek = chatUpdate.messages[0];

        if (!mek.message) return;
        mek.message = mek.message.ephemeralMessage?.message || mek.message;

        if (mek.key && mek.key.remoteJid === 'status@broadcast') {
          let emoji = ["😂", "❤️", "🌚", "😍", "😭"];
          let react = emoji[Math.floor(Math.random() * emoji.length)];
          await Gifted.readMessages([mek.key]);
          await Gifted.sendMessage('status@broadcast', {
            react: { text: react, key: mek.key }
          }, { statusJidList: [mek.key.participant] });
        }
      } catch (err) {
        console.error('AutoStatus Error:', err);
      }
    }
  })
}
 
// admin event
Gifted.ev.on('group-participants.update', async (anu) => {
  if (!global.adminevent) return;
  console.log(anu);

  try {
    let participants = anu.participants;

    for (let num of participants) {
      let ppuser, ppgroup;

      try {
        ppuser = await Gifted.profilePictureUrl(num, 'image');
      } catch (err) {
        ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';
      }

      try {
        ppgroup = await Gifted.profilePictureUrl(anu.id, 'image');
      } catch (err) {
        ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60';
      }

      const nameTag = `@${num.split("@")[0]}`;
      const time = moment.tz('Africa/Nairobi').format('HH:mm:ss');
      const date = moment.tz('Africa/Nairobi').format('DD/MM/YYYY');

      if (anu.action === 'promote') {
        const promoteMsg = `🎉 𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘀 ${nameTag}, you have been *promoted* to *admin* 🥳`;

        await Gifted.sendMessage(anu.id, {
          text: promoteMsg,
          contextInfo: {
            mentionedJid: [num],
            externalAdReply: {
              showAdAttribution: true,
              containsAutoReply: true,
              title: `${global.botname}`,
              body: `${global.ownername}`,
              previewType: "PHOTO",
              thumbnailUrl: ppuser,
              thumbnail: await getBuffer(ppuser),
              sourceUrl: global.wagc
            }
          }
        });
      }

      if (anu.action === 'demote') {
        const demoteMsg = `😬 𝗢𝗼𝗽𝘀‼️ ${nameTag}, you have been *demoted* from *admin*`;

        await Gifted.sendMessage(anu.id, {
          text: demoteMsg,
          contextInfo: {
            mentionedJid: [num],
            externalAdReply: {
              showAdAttribution: true,
              containsAutoReply: true,
              title: `${global.botname}`,
              body: `${global.ownername}`,
              previewType: "PHOTO",
              thumbnailUrl: ppuser,
              thumbnail: await getBuffer(ppuser),
              sourceUrl: global.wagc
            }
          }
        });
      }
    }
  } catch (err) {
    console.error('Admin Event Error:', err);
  }
});

// detect group update
      Gifted.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
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
            if (!(v.name || v.subject)) v = Gifted.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === Gifted.decodeJid(Gifted.user.id) ?
            Gifted.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

Gifted.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await Gifted.getName(i),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await Gifted.getName(i)}\nFN:${await Gifted.getName(i)}\nitem1.TEL;waid=${i.split('@')[0]}:${i.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
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
    Gifted.sendImage = async (jid, path, caption = '', quoted = '', options = {}) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await Gifted.sendMessage(jid, {
            image: buffer,
            caption: caption,
            ...options
        }, {
            quoted
        })
    }
    Gifted.sendTextWithMentions = async (jid, text, quoted, options = {}) => Gifted.sendMessage(jid, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
    }, {
        quoted
    })
    Gifted.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await Gifted.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
.then( response => {
fs.unlinkSync(buffer)
return response
})
}

 Gifted.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ? path :
        /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') :
        /^https?:\/\//.test(path) ? await (await getBuffer(path)) :
        fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
    let buffer
    if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options)
    } else {
        buffer = await videoToWebp(buff)
    }
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
    trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
    await fs.writeFileSync(trueFileName, buffer)
    return trueFileName
}

Gifted.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype
    if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message
            ? message.message.ephemeralMessage.message : (message.message || undefined)
        vtype = Object.keys(message.message.viewOnceMessage.message)[0]
        delete message.message?.ignore
        delete message.message.viewOnceMessage.message[vtype].viewOnce
        message.message = {
            ...message.message.viewOnceMessage.message
        }
    }
    let mtype = Object.keys(message.message)[0]
    let content = await generateForwardMessageContent(message, forceForward)
    let ctype = Object.keys(content)[0]
    let context = {}
    if (mtype != "conversation") context = message.message[mtype].contextInfo
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

async function Dave() {
    if (fs.existsSync(credsPath)) {
        console.log(color("Session file found, starting bot...", 'yellow'))
        await startBellah()
    } else {
        const sessionDownloaded = await downloadSessionData()
        if (sessionDownloaded) {
            console.log("Session downloaded, starting bot.")
            await startBellah()
        } else {
            if (!fs.existsSync(credsPath)) {
                if (!global.SESSION_ID) {
                    console.log(color("Please wait for a few seconds to enter your number!", 'red'))
                    await startBellah()
                }
            }
        }
    }
}

Dave()

process.on('uncaughtException', function (err) {
    let e = String(err)
    if (e.includes("conflict")) return
    if (e.includes("Socket connection timeout")) return
    if (e.includes("not-authorized")) return
    if (e.includes("already-exists")) return
    if (e.includes("rate-overlimit")) return
    if (e.includes("Connection Closed")) return
    if (e.includes("Timed Out")) return
    if (e.includes("Value not found")) return
    console.log('Caught exception: ', err)
})
        
