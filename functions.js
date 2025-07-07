/**
 * DAVE-XMD - Common Bot Utilities
 */

const fs = require('fs')
const crypto = require('crypto')

exports.runtime = (seconds) => {
    seconds = Number(seconds)
    const pad = (s) => (s < 10 ? '0' : '') + s
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
}

exports.formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

exports.clockString = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-GB', { hour12: false })
}

exports.randomName = (ext = '') => {
    return crypto.randomBytes(5).toString('hex') + ext
}

exports.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
