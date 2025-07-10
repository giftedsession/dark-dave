const fs = require("fs");
const path = require("path");

let handler = async (m, { Gifted,Owner, reply, text, example }) => {
    if (!text) return m.reply('📄 Provide a plugin name.\nExample: .getplugin ping.js');
    if (!text.endsWith(".js")) return m.reply("⚠️ Plugin file name must end with `.js`");

    const filePath = path.join(__dirname, text.toLowerCase());
    if (!fs.existsSync(filePath)) return m.reply("❌ Plugin file not found in /plugins");

    try {
        const pluginData = fs.readFileSync(filePath, 'utf-8');
        return m.reply(`🧩 *𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 Plugin Source: ${text}*\n\n\`\`\`\n${pluginData}\n\`\`\``);
    } catch (e) {
        console.error("READ ERROR:", e);
        return m.reply("⚠️ Failed to read the plugin file.");
    }
};

handler.help = ['getplugin'];
handler.tags = ['tools'];
handler.command = ['getp', 'gp', 'getplugins', 'getplugin'];

module.exports = handler;
