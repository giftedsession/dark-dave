
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
const { default: BellahConnect, getAggregateVotesInPollMessage, delay, PHONENUMBER_MCC, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require("@whiskeysockets/baileys")
const channelId = "120363257205745956@newsletter";
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
nocache('../Gifted.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))

// 🔁 It's okay to reload main.js too if needed:
require('./main.js')
nocache('../main.js', module => console.log(color('[ CHANGE ]', 'green'), color(`'${module}'`, 'green'), 'Updated'))

//------------------------------------------------------
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
        return console.log(color(`Session id not found at SESSION_ID!\nCreds.json not found at session folder!\n\nWait to enter your number`, 'red'));
      }

      const base64Data = global.SESSION_ID.split("Bellah~")[1];

      const sessionData = Buffer.from(base64Data, 'base64');

        await fs.promises.writeFile(credsPath, sessionData);
      console.log(color(`Session successfully saved, please wait!!`, 'green'));
      await startBellah();
    }
  } catch (error) {
    console.error('Error downloading session data:', error);
  }
}


async function startBellah() {
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache() // for retry message, "waiting message"
    const Bellah = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode, // popping up QR in terminal log
      mobile: useMobile, // mobile api (prone to bans)
      browser: [ "Ubuntu", "Chrome", "20.0.04" ], // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
     auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      markOnlineOnConnect: true, // set false for offline
      generateHighQualityLinkPreview: true, // make high preview link
      getMessage: async (key) => {
         let jid = jidNormalizedUser(key.remoteJid)
         let msg = await store.loadMessage(jid, key.id)

         return msg?.message || ""
      },
      msgRetryCounterCache, // Resolve waiting messages
      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
   })

   store.bind(Bellah.ev)

    // login use pairing code
   // source code https://github.com/WhiskeySockets/Baileys/blob/master/Example/example.ts#L61
   if (pairingCode && !Bellah.authState.creds.registered) {
      if (useMobile) throw new Error('Cannot use pairing code with mobile api')

      let phoneNumber
      if (!!phoneNumber) {
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +254xxx")))
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
         let code = await Bellah.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }

Bellah.ev.on('connection.update', async (update) => {
        const {

                connection,
                lastDisconnect
        } = update
try{
                if (connection === 'close') {
                        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
                        if (reason === DisconnectReason.badSession) {
                                console.log(`Bad Session File, Please Delete Session and Scan Again`);
                                startBellah()
                        } else if (reason === DisconnectReason.connectionClosed) {
                                console.log("Connection closed, reconnecting....");
                                startBellah();
                        } else if (reason === DisconnectReason.connectionLost) {
                                console.log("Connection Lost from Server, reconnecting...");
                                startBellah();
                        } else if (reason === DisconnectReason.connectionReplaced) {
                                console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                                startBellah()
                        } else if (reason === DisconnectReason.loggedOut) {
                                console.log(`Device Logged Out, Please Delete Session and Scan Again.`);
                                startBellah();
                        } else if (reason === DisconnectReason.restartRequired) {
                                console.log("Restart Required, Restarting...");
                                startBellah();
                        } else if (reason === DisconnectReason.timedOut) {
                                console.log("Connection TimedOut, Reconnecting...");
                                startBellah();
                        } else Bellah.end(`Unknown DisconnectReason: ${reason}|${connection}`)
                }
                if (update.connection == "connecting" || update.receivedPendingNotifications == "false") {
                        console.log(color(`\nConnecting...`, 'white'))
                }
                if (update.connection == "open" || update.receivedPendingNotifications == "true") {
                        console.log(color(` `,'magenta'))
            console.log(color(`Connected to => ` + JSON.stringify(Bellah.user, null, 2), 'green'))
                        await delay(1999)
                        Bellah.sendMessage(Bellah.user.id, {
image: {
url: 'https://url.bwmxmd.online/Adams.s0tso4x6.jpg'
}, 
caption: ` VolTah Xmd (Bellah Xmd V2) connected
> Bot prefix: ${global.xprefix}

> Owner: ${global.ownernumber}

> BotName: ${global.botname}

> Total Command: 138

> Mode:  ${Bellah.public ? '𝗣𝘂𝗯𝗹𝗶𝗰 ϟ' : '𝗣𝗿𝗶𝘃𝗮𝘁𝗲 ϟ'}
       
