const axios = require('axios');

let handler = async (m, { Owner, appname, Gifted, herokuapi }) => {
    if (!Owner) return m.reply("❌ Only the owner can use this command.");

    if (!appname || !herokuapi) {
        return m.reply("⚠️ Your Heroku App Name or API key is missing. Please set the `APP_NAME` and `HEROKU_API` environment variables.");
    }

    try {
        const response = await axios.post(
            `https://api.heroku.com/apps/${appname}/builds`,
            {
                source_blob: {
                    // ✅ updated to use your real repo
                    url: "https://github.com/giftedsession/dark-dave/tarball/main"
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${herokuapi}`,
                    Accept: "application/vnd.heroku+json; version=3",
                },
            }
        );

        await m.reply("🚀 𝐃𝐀𝐑𝐊-𝐃𝐀𝐕𝐄 is now pulling fresh updates from GitHub.\nPlease wait ~2 minutes while the redeploy completes.");
        console.log("✅ Heroku build started:", response.data);
    } catch (e) {
        const err = e.response?.data || e.message;
        console.error("❌ Redeploy failed:", err);
        m.reply("❌ Update failed. Check your Heroku API key and app name.");
    }
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update'];
handler.owner = true;

module.exports = handler;
