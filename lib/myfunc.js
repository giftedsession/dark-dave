const {
    proto,
    getContentType
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const moment = require('moment-timezone');
const util = require('util');
const Jimp = require('jimp');

// Basic formatters
const runtime = (seconds) => {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
};

const clockString = (ms) => {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor((ms % 3600000) / 60000);
    let s = Math.floor((ms % 60000) / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
};

// Random string
const getRandom = (ext = '') => `${Math.floor(Math.random() * 10000)}${ext}`;

// Mention parser
const parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
};

// Group admin checker
const getGroupAdmins = (participants = []) => {
    return participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
};

// HTTP fetchers
const fetchBuffer = async (url, options = {}) => {
    const res = await axios.get(url, { ...options, responseType: 'arraybuffer' });
    return res.data;
};

const fetchJson = async (url, options = {}) => {
    const res = await axios.get(url, options);
    return res.data;
};

// Resize images
const reSize = async (buffer, w, h) => {
    const image = await Jimp.read(buffer);
    return await image.resize(w, h).getBufferAsync(Jimp.MIME_JPEG);
};

// WA Message Serializer
const smsg = (conn, m, store) => {
    if (!m) return m;
    let M = proto.WebMessageInfo;

    m.id = m.key.id;
    m.isBaileys = m.id?.startsWith('BAE5') && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = conn.decodeJid(m.fromMe ? conn.user.id : m.participant || m.key.participant || m.chat || '');

    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = m.message[m.mtype];
        m.text = m.message.conversation || m.msg.caption || m.msg.text;
        m.mentionedJid = m.msg.contextInfo?.mentionedJid || [];

        m.reply = (text, chatId = m.chat, options = {}) =>
            conn.sendMessage(chatId, { text, ...options }, { quoted: m });
    }

    return m;
};

module.exports = {
    runtime,
    clockString,
    getRandom,
    fetchBuffer,
    fetchJson,
    parseMention,
    getGroupAdmins,
    smsg,
    reSize
};
