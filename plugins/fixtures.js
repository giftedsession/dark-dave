const axios = require('axios')

let handler = async (m, { fetchJson }) => {
  try {
    const leagues = {
      PL: '🇬🇧 𝐏𝐫𝐞𝐦𝐢𝐞𝐫 𝐋𝐞𝐚𝐠𝐮𝐞',
      PD: '🇪🇸 𝐋𝐚 𝐋𝐢𝐠𝐚',
      BL1: '🇩🇪 𝐁𝐮𝐧𝐝𝐞𝐬𝐥𝐢𝐠𝐚',
      SA: '🇮🇹 𝐒𝐞𝐫𝐢𝐞 𝐀',
      FR: '🇫🇷 𝐋𝐢𝐠𝐮𝐞 𝟏'
    }

    let message = `╭─「 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 𝐅𝐢𝐱𝐭𝐮𝐫𝐞𝐬 ⚽ 」\n│\n`

    for (const code in leagues) {
      const res = await fetchJson(`https://api.dreaded.site/api/matches/${code}`)
      const leagueMatches = res.data

      if (typeof leagueMatches === 'string') {
        message += `│ ${leagues[code]}:\n│ ${leagueMatches}\n│\n`
      } else if (leagueMatches.length > 0) {
        message += `│ ${leagues[code]}:\n`
        leagueMatches.forEach(({ game, date, time }) => {
          message += `│ ${game}\n│ Date: ${date}\n│ Time: ${time} (EAT)\n│\n`
        })
      } else {
        message += `│ ${leagues[code]}: No matches scheduled\n│\n`
      }
    }

    message += `╰─⌯ 𝗧𝗶𝗺𝗲 & 𝗗𝗮𝘁𝗲 𝗮𝗿𝗲 𝗶𝗻 𝗘𝗔𝗧 (𝗘𝗮𝘀𝘁 𝗔𝗳𝗿𝗶𝗰𝗮 𝗧𝗶𝗺𝗲)\nPowered by 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃 ⚡`

    await m.reply(message)
  } catch (error) {
    m.reply(`❌ Failed to fetch fixtures.\n${error}`)
  }
}

handler.help = ['fixtures']
handler.tags = ['updates']
handler.command = ['fixtures', 'matches']

module.exports = handler
