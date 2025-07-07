// lib/remini.js

const FormData = require('form-data');
const https = require('https');

/**
 * Enhance or modify image using Vyro AI
 * @param {Buffer} buffer - Image buffer
 * @param {string} type - enhance | dehaze | recolor
 * @returns {Promise<Buffer>}
 */
async function remini(buffer, type = 'enhance') {
    return new Promise((resolve, reject) => {
        const allowedTypes = ['enhance', 'recolor', 'dehaze'];
        if (!allowedTypes.includes(type)) type = 'enhance';

        const form = new FormData();
        form.append('model_version', '1', {
            'Content-Transfer-Encoding': 'binary',
            contentType: 'image/jpeg'
        });
        form.append('image', Buffer.from(buffer), {
            filename: 'enhance_image_body.jpg',
            contentType: 'image/jpeg'
        });

        const req = https.request({
            method: 'POST',
            hostname: 'inferenceengine.vyro.ai',
            path: `/${type}`,
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'okhttp/4.9.3',
                'Connection': 'Keep-Alive',
                'Accept-Encoding': 'gzip'
            }
        }, (res) => {
            let chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        });

        form.pipe(req);
    });
}

module.exports = { remini };
