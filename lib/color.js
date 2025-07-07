const chalk = require('chalk')

// Foreground color
const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

// Background color
const bgcolor = (text, bgcolor) => {
    return !bgcolor ? chalk.green(text) : chalk.bgKeyword(bgcolor)(text)
}

module.exports = {
    color,
    bgcolor
}
