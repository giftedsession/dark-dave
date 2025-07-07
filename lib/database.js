/**
 * DAVE-XMD - Simple JSON Database Handler
 * Auto-loads and saves JSON files
 */

const fs = require('fs')
const path = require('path')

const dbFiles = {
    users: path.join(__dirname, '../src/data/json/user.json'),
    groups: path.join(__dirname, '../src/data/json/group.json'),
    chats: path.join(__dirname, '../src/data/json/chat.json'),
    stickers: path.join(__dirname, '../src/data/json/sticker.json'),
    settings: path.join(__dirname, '../src/data/json/settings.json')
}

const database = {}

for (const [key, file] of Object.entries(dbFiles)) {
    if (!fs.existsSync(file)) {
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, '{}')
    }
    database[key] = JSON.parse(fs.readFileSync(file))
}

// Auto-save function
const saveAll = () => {
    for (const [key, file] of Object.entries(dbFiles)) {
        fs.writeFileSync(file, JSON.stringify(database[key], null, 2))
    }
}

// Auto-save every 15s
setInterval(saveAll, 15 * 1000)

module.exports = database
