/**
 * DAVE-XMD - EXIF Handler
 * Converts media to webp and adds sticker metadata
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const { writeFile } = require('fs/promises')
const webp = require('node-webpmux')

exports.imageToWebp = (media) => {
    return new Promise((resolve, reject) => {
        const tmp = path.join(tmpdir(), `${Date.now()}.jpg`)
        const out = path.join(tmpdir(), `${Date.now()}.webp`)
        fs.writeFileSync(tmp, media)
        spawn('ffmpeg', ['-i', tmp, '-vf', "scale=512:512:force_original_aspect_ratio=decrease", '-qscale', '100', '-compression_level', '6', '-preset', 'default', '-an', '-vsync', '0', out])
            .on('error', reject)
            .on('close', () => {
                fs.unlinkSync(tmp)
                resolve(fs.readFileSync(out))
                fs.unlinkSync(out)
            })
    })
}

exports.videoToWebp = (media) => {
    return new Promise((resolve, reject) => {
        const tmp = path.join(tmpdir(), `${Date.now()}.mp4`)
        const out = path.join(tmpdir(), `${Date.now()}.webp`)
        fs.writeFileSync(tmp, media)
        spawn('ffmpeg', ['-i', tmp, '-vf', "scale=512:512:force_original_aspect_ratio=decrease,fps=15", '-qscale', '100', '-compression_level', '6', '-preset', 'default', '-an', '-vsync', '0', out])
            .on('error', reject)
            .on('close', () => {
                fs.unlinkSync(tmp)
                resolve(fs.readFileSync(out))
                fs.unlinkSync(out)
            })
    })
}

exports.writeExifImg = async (media, packname, author) => {
    const img = new webp.Image()
    await img.load(media)
    const exif = {
        "sticker-pack-id": "https://github.com/gifteddaves/DAVE-XMD",
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        emojis: [""]
    }
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        ...Buffer.from(JSON.stringify(exif)),
        0x00
    ])
    img.exif = exifAttr
    return await img.save(null)
}

exports.writeExifVid = async (media, packname, author) => {
    return await exports.writeExifImg(media, packname, author)
                }
