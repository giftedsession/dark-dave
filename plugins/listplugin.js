const fs = require("fs");
const path = require("path");

let handler = async (m) => {
    const pluginFolder = path.join(__dirname);
    const files = fs.readdirSync(pluginFolder).filter(file => file.endsWith(".js"));

    if (files.length === 0) return m.reply("📂 No plugins found in /plugins");

    let list = files.map(f => `🔹 ${f}`).join("\n");

    await m.reply(`🧩 *𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 Plugins Loaded:*\n\n${list}`);
};

handler.help = ['listplugin'];
handler.tags = ['plugins'];
handler.command = ['listplugin', 'listplugins'];

module.exports = handler;
