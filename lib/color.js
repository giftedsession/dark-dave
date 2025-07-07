/**
 * DAVE-XMD - Color Logger
 * Terminal log colors using chalk
 */

const chalk = require('chalk')

const color = (text, color) => {
    return !chalk[color] ? chalk.green(text) : chalk[color](text)
}

const bgcolor = (text, bgColor) => {
    return !chalk[`bg${bgColor}`] ? chalk.bgGreen(text) : chalk[`bg${bgColor}`](text)
}

module.exports = { color, bgcolor }
