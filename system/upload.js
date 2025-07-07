const { modul } = require('./system/module');
const { axios, chalk, fs, fetch, FormData, FileType } = modul;
const { fromBuffer } = FileType;

/**
 * Upload a file to telegra.ph and return its URL.
 * @param {string} path - Local file path.
 * @returns {Promise<string>} URL to the uploaded file.
 */
async function uptotelegra(path) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(path)) return reject(new Error("❌ File not found: " + path));
        
        try {
            const form = new FormData();
            form.append("file", fs.createReadStream(path));

            const res = await axios({
                url: "https://telegra.ph/upload",
                method: "POST",
                headers: {
                    ...form.getHeaders()
                },
                data: form
            });

            if (res.data && res.data[0] && res.data[0].src) {
                return resolve("https://telegra.ph" + res.data[0].src);
            } else {
                return reject(new Error("❌ Unexpected response from telegra.ph"));
            }

        } catch (err) {
            return reject(new Error("📥 Upload error: " + err.message));
        }
    });
}

module.exports.uptotelegra = uptotelegra;

// 🔁 Auto-reload on save
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`📦 Updated: ${__filename}`));
    delete require.cache[file];
    require(file);
});
