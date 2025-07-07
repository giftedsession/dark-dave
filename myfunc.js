/**
 * DAVE-XMD - Group & Utility Functions
 */

const getGroupAdmins = (participants = []) => {
    return participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id)
}

const pickRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)]
}

const formatDate = (epoch = Date.now(), locale = 'en-KE') => {
    return new Date(epoch).toLocaleDateString(locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
}

const getTime = (locale = 'en-KE') => {
    return new Date().toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

const isUrl = (url) => {
    return /https?:\/\/[^\s]+/.test(url)
}

module.exports = {
    getGroupAdmins,
    pickRandom,
    formatDate,
    getTime,
    isUrl
}
