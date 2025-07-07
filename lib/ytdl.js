const fs = require('fs')
const path = require('path')
const yts = require('youtube-yts')
const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')
const NodeID3 = require('node-id3')
const { randomBytes } = require('crypto')

const AUDIO_PATH = path.join(__dirname, '../media/audio')
const VIDEO_PATH = path.join(__dirname, '../media/video')

// Ensure directories exist
if (!fs.existsSync(AUDIO_PATH)) fs.mkdirSync(AUDIO_PATH, { recursive: true })
if (!fs.existsSync(VIDEO_PATH)) fs.mkdirSync(VIDEO_PATH, { recursive: true })

const YT = {
  isYTUrl: (url) => {
    return /(?:youtube\.com|youtu\.be)/.test(url)
  },

  getID: (url) => {
    if (!YT.isYTUrl(url)) throw new Error('Invalid YouTube URL')
    return ytdl.getURLVideoID(url)
  },

  search: async (query) => {
    const result = await yts.search(query)
    return result.videos
  },

  downloadAudio: async (url, writeTags = false) => {
    const id = YT.getID(url)
    const info = await ytdl.getInfo(id)
    const filename = `${randomBytes(4).toString('hex')}.mp3`
    const filepath = path.join(AUDIO_PATH, filename)

    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })

    await new Promise((resolve, reject) => {
      ffmpeg(stream)
        .audioBitrate(128)
        .toFormat('mp3')
        .save(filepath)
        .on('end', resolve)
        .on('error', reject)
    })

    if (writeTags) {
      NodeID3.write({
        title: info.videoDetails.title,
        artist: info.videoDetails.author.name,
        album: 'YouTube',
        year: info.videoDetails.publishDate?.split('-')[0],
        image: {
          mime: 'jpeg',
          type: { id: 3, name: 'front cover' },
          imageBuffer: await fetchBuffer(info.videoDetails.thumbnails.pop().url)
        }
      }, filepath)
    }

    return {
      type: 'audio',
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      duration: info.videoDetails.lengthSeconds,
      path: filepath,
      size: fs.statSync(filepath).size
    }
  },

  downloadVideo: async (url, quality = 'highest') => {
    const id = YT.getID(url)
    const info = await ytdl.getInfo(id)
    const filename = `${randomBytes(4).toString('hex')}.mp4`
    const filepath = path.join(VIDEO_PATH, filename)

    const stream = ytdl(url, { quality })

    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filepath)
      stream.pipe(writeStream)
      stream.on('end', resolve)
      stream.on('error', reject)
    })

    return {
      type: 'video',
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      duration: info.videoDetails.lengthSeconds,
      path: filepath,
      size: fs.statSync(filepath).size
    }
  }
}

async function fetchBuffer(url) {
  const axios = require('axios')
  const res = await axios.get(url, { responseType: 'arraybuffer' })
  return res.data
}

module.exports = YT
