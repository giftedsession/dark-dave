const fs = require('fs')
const path = require("path")
const { tmpdir } = require("os")
const Crypto = require("crypto")
const ff = require('fluent-ffmpeg')
const webp = require("node-webpmux")
const { Image } = require('node-webpmux')

// Convert image to .webp
async function imageToWebp(media) {
  const tmpFileIn = path.join(tmpdir(), `${randomName()}.jpg`)
  const tmpFileOut = path.join(tmpdir(), `${randomName()}.webp`)
  fs.writeFileSync(tmpFileIn, media)

  await new Promise((resolve, reject) => {
    ff(tmpFileIn)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec", "libwebp",
        "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
      ])
      .toFormat("webp")
      .save(tmpFileOut)
  })

  const buff = fs.readFileSync(tmpFileOut)
  fs.unlinkSync(tmpFileIn)
  fs.unlinkSync(tmpFileOut)
  return buff
}

// Convert video to .webp
async function videoToWebp(media) {
  const tmpFileIn = path.join(tmpdir(), `${randomName()}.mp4`)
  const tmpFileOut = path.join(tmpdir(), `${randomName()}.webp`)
  fs.writeFileSync(tmpFileIn, media)

  await new Promise((resolve, reject) => {
    ff(tmpFileIn)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec", "libwebp",
        "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
        "-loop", "0",
        "-ss", "00:00:00",
        "-t", "00:00:05",
        "-preset", "default",
        "-an",
        "-vsync", "0"
      ])
      .toFormat("webp")
      .save(tmpFileOut)
  })

  const buff = fs.readFileSync(tmpFileOut)
  fs.unlinkSync(tmpFileIn)
  fs.unlinkSync(tmpFileOut)
  return buff
}

// Add EXIF metadata to image
async function writeExifImg(media, metadata) {
  const webpData = await imageToWebp(media)
  return await embedExif(webpData, metadata)
}

// Add EXIF metadata to video
async function writeExifVid(media, metadata) {
  const webpData = await videoToWebp(media)
  return await embedExif(webpData, metadata)
}

// Universal EXIF writer
async function writeExif(media, metadata) {
  let wMedia = /webp/.test(media.mimetype) ? media.data
              : /image/.test(media.mimetype) ? await imageToWebp(media.data)
              : /video/.test(media.mimetype) ? await videoToWebp(media.data)
              : ""
  return await embedExif(wMedia, metadata)
}

// Embed EXIF metadata
async function embedExif(buffer, metadata) {
  const tmpFileIn = path.join(tmpdir(), `${randomName()}.webp`)
  const tmpFileOut = path.join(tmpdir(), `${randomName()}.webp`)
  fs.writeFileSync(tmpFileIn, buffer)

  if (metadata.packname || metadata.author) {
    const img = new webp.Image()
    const json = {
      "sticker-pack-id": "https://github.com/gifteddevsmd/DAVE-XMD",
      "sticker-pack-name": metadata.packname,
      "sticker-pack-publisher": metadata.author,
      "emojis": metadata.categories || [""]
    }
    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ])
    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
    const exif = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)

    await img.load(tmpFileIn)
    img.exif = exif
    await img.save(tmpFileOut)
    fs.unlinkSync(tmpFileIn)
    return tmpFileOut
  }
}

// Add EXIF directly from buffer
async function addExif(buffer, packname, author, categories = [""], extra = {}) {
  const img = new Image()
  const json = {
    "sticker-pack-id": "𝐃𝐀𝐕𝐄-𝐗𝐌𝐃",
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author,
    "emojis": categories,
    "is-avatar-sticker": 1,
    ...extra
  }
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ])
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)

  await img.load(buffer)
  img.exif = exif
  return await img.save(null)
}

// Generate random name
function randomName() {
  return Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)
}

module.exports = {
  addExif,
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid,
  writeExif
          }
