/**
 * 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 - Loader Utility
 * Watches and hot-reloads bot modules during development
 */

const fs = require('fs')
const { color } = require('./color')

/**
 * Clears module cache so it can be re-required.
 * @param {string} module
 * @returns {Promise<void>}
 */
async function uncache(module = '.') {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(module)]
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * Watches file and reloads module on change
 * @param {string} module
 * @param {Function} cb
 */
async function nocache(module, cb = () => {}) {
    console.log(color('⏳ MODULE:', 'blue'), color(`'${module} is up to date!'`, 'cyan'))
    fs.watchFile(require.resolve(module), async () => {
        await uncache(require.resolve(module))
        cb(module)
    })
}

module.exports = {
    uncache,
    nocache
}
