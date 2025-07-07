const axios = require('axios')
const cheerio = require('cheerio')
const FormData = require('form-data')
const { queryString } = require('object-query-string')

/**
 * Generate a PhotoOxy image
 * @param {string} url - The PhotoOxy URL to use
 * @param {string[]} text - Array of input texts
 */
const photoOxy = (url, text) => new Promise(async (resolve, reject) => {
  try {
    const getPage = await axios.get(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
      }
    })

    const token = /name="token" value="(.*?)"/.exec(getPage.data)[1]
    const build_server = /name="build_server" value="(.*?)"/.exec(getPage.data)[1]
    const build_server_id = /name="build_server_id" value="(.*?)"/.exec(getPage.data)[1]
    const cookie = getPage.headers['set-cookie'][0]

    const form = new FormData()
    if (typeof text === 'string') text = [text]
    for (let t of text) form.append('text[]', t)

    form.append('submit', 'GO')
    form.append('token', token)
    form.append('build_server', build_server)
    form.append('build_server_id', build_server_id)

    const result = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
        'user-agent': 'Mozilla/5.0',
        'cookie': cookie
      }
    })

    const formValue = /<div.*?id="form_value".*>(.*?)<\/div>/.exec(result.data)[1]
    const imageData = await axios.get(`https://photooxy.com/effect/create-image?` + queryString(JSON.parse(formValue)), {
      headers: {
        'user-agent': 'Mozilla/5.0',
        'cookie': cookie
      }
    })

    const json = imageData.data
    if (!json.image) return reject('No image returned')
    resolve(build_server + json.image)

  } catch (err) {
    reject(err)
  }
})

/**
 * Generate PhotoOxy with radio option
 */
const photoOxyRadio = (url, text, radio) => new Promise(async (resolve, reject) => {
  try {
    const getPage = await axios.get(url, {
      headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 10)' }
    })

    const token = /name="token" value="(.*?)"/.exec(getPage.data)[1]
    const build_server = /name="build_server" value="(.*?)"/.exec(getPage.data)[1]
    const build_server_id = /name="build_server_id" value="(.*?)"/.exec(getPage.data)[1]
    const cookie = getPage.headers['set-cookie'][0]

    const form = new FormData()
    form.append('radio0[radio]', radio)
    if (typeof text === 'string') text = [text]
    for (let t of text) form.append('text[]', t)

    form.append('submit', 'GO')
    form.append('token', token)
    form.append('build_server', build_server)
    form.append('build_server_id', build_server_id)

    const result = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
        'user-agent': 'Mozilla/5.0',
        'cookie': cookie
      }
    })

    const formValue = /<div.*?id="form_value".*>(.*?)<\/div>/.exec(result.data)[1]
    const imageData = await axios.get(`https://photooxy.com/effect/create-image?` + queryString(JSON.parse(formValue)), {
      headers: {
        'user-agent': 'Mozilla/5.0',
        'cookie': cookie
      }
    })

    const json = imageData.data
    if (!json.image) return reject('No image returned')
    resolve(build_server + json.image)

  } catch (err) {
    reject(err)
  }
})

module.exports = {
  photoOxy,
  photoOxyRadio
}
