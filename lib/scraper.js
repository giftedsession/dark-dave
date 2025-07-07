const cheerio = require('cheerio');
const axios = require('axios');
const qs = require('qs');

// Random Array
const randomarray = async (array) => array[Math.floor(Math.random() * array.length)];

// Wallpapers
function wallpaper(title, page = '1') {
    return axios.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${title}`).then(({ data }) => {
        let $ = cheerio.load(data);
        return $('div.grid-item').map((_, b) => ({
            title: $(b).find('div.info > a > h3').text(),
            type: $(b).find('div.info > a:nth-child(2)').text(),
            source: 'https://www.besthdwallpaper.com/' + $(b).find('div > a:nth-child(3)').attr('href'),
            image: [
                $(b).find('picture > img').attr('data-src') || $(b).find('picture > img').attr('src'),
                $(b).find('picture > source:nth-child(1)').attr('srcset'),
                $(b).find('picture > source:nth-child(2)').attr('srcset')
            ]
        })).get();
    });
}

// Wikimedia Images
function wikimedia(title) {
    return axios.get(`https://commons.wikimedia.org/w/index.php?search=${title}&title=Special:MediaSearch&go=Go&type=image`)
        .then(res => {
            const $ = cheerio.load(res.data);
            return $('.sdms-search-results__list-wrapper > div > a').map((_, el) => ({
                title: $(el).find('img').attr('alt'),
                source: $(el).attr('href'),
                image: $(el).find('img').attr('data-src') || $(el).find('img').attr('src')
            })).get();
        });
}

// Pinterest
function pinterest(query) {
    return axios.get(`https://id.pinterest.com/search/pins/?autologin=true&q=${query}`)
        .then(({ data }) => {
            const $ = cheerio.load(data);
            const result = [];
            $('div > a img').each((_, el) => {
                let src = $(el).attr('src')?.replace(/236/g, '736');
                if (src) result.push(src);
            });
            return result;
        });
}

// GitHub Stalk
async function githubstalk(user) {
    const { data } = await axios.get(`https://api.github.com/users/${user}`);
    return {
        username: data.login,
        nickname: data.name,
        bio: data.bio,
        id: data.id,
        profile_pic: data.avatar_url,
        url: data.html_url,
        public_repo: data.public_repos,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at
    };
}

// NPM Stalk
async function npmstalk(pkg) {
    const { data } = await axios.get(`https://registry.npmjs.org/${pkg}`);
    const versions = Object.keys(data.versions);
    const latest = data.versions[versions[versions.length - 1]];
    return {
        name: pkg,
        versionLatest: versions[versions.length - 1],
        versionCount: versions.length,
        latestDependencies: Object.keys(latest.dependencies || {}).length,
        publishTime: data.time.created
    };
}

// Free Fire Stalk
async function ffstalk(userId) {
    const res = await axios.post('https://order.codashop.com/id/initPayment.action', {
        "user.userId": userId,
        voucherTypeName: "FREEFIRE"
    }, {
        headers: { "Content-Type": "application/json" }
    });
    return {
        id: userId,
        nickname: res.data.confirmationFields?.roles?.[0]?.role
    };
}

// MLBB Stalk
async function mlstalk(id, zoneId) {
    const { data } = await axios.post('https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store',
        new URLSearchParams({
            productId: '1',
            itemId: '2',
            catalogId: '57',
            paymentId: '352',
            gameId: id,
            zoneId,
            product_ref: 'REG',
            product_ref_denom: 'AE'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Referer: 'https://www.duniagames.co.id/',
                Accept: 'application/json'
            }
        });
    return data.data.gameDetail;
}

// AI Downloader
function aiovideodl(link) {
    return axios.get('https://aiovideodl.ml/').then(src => {
        const $ = cheerio.load(src.data);
        const token = $('#token').attr('value');
        return axios.post('https://aiovideodl.ml/wp-json/aio-dl/video-data/', new URLSearchParams({ url: link, token }))
            .then(({ data }) => data);
    });
}

// IG Stalk (⚠️ deprecated API usage — unstable)
function igstalk(username) {
    return axios.get(`https://www.instagram.com/${username}/?__a=1`)
        .then(({ data }) => {
            const user = data.graphql.user;
            return {
                username: user.username,
                fullName: user.full_name,
                followers: user.edge_followed_by.count,
                following: user.edge_follow.count,
                posts: user.edge_owner_to_timeline_media.count,
                bio: user.biography,
                profilePic: user.profile_pic_url_hd,
                verified: user.is_verified
            };
        });
}

// Umma Scraper (Islamic articles)
function umma(url) {
    return axios.get(url).then(res => {
        const $ = cheerio.load(res.data);
        const image = $('#article-content img').map((_, el) => $(el).attr('src')).get();
        return {
            title: $('h1').text().trim(),
            author: $('#wrap .user-ame').text().trim(),
            media: $('#article-content iframe').attr('src') ? [$('#article-content iframe').attr('src')] : image,
            type: $('#article-content iframe').attr('src') ? 'video' : 'image'
        };
    });
}

// Quotes Anime
function quotesAnime() {
    const page = Math.floor(Math.random() * 184);
    return axios.get(`https://otakotaku.com/quote/feed/${page}`).then(({ data }) => {
        const $ = cheerio.load(data);
        return $('div.kotodama-list').map((_, el) => ({
            character: $(el).find('.char-name').text().trim(),
            anime: $(el).find('.anime-title').text().trim(),
            quotes: $(el).find('.quote').text().trim()
        })).get();
    });
}

// Hentai (sfmcompile)
function hentai() {
    const page = Math.floor(Math.random() * 1153);
    return axios.get(`https://sfmcompile.club/page/${page}`).then(({ data }) => {
        const $ = cheerio.load(data);
        return $('#primary article').map((_, el) => ({
            title: $(el).find('h2').text(),
            link: $(el).find('h2 > a').attr('href'),
            type: $(el).find('source').attr('type') || 'image/jpeg',
            media: $(el).find('source').attr('src') || $(el).find('img').attr('data-src')
        })).get();
    });
}

// Porn (tikporntok)
function porno() {
    return axios.get('https://tikporntok.com/?random=1').then(({ data }) => {
        const $ = cheerio.load(data);
        return {
            title: $('article > h1').text(),
            video: $('div.vx_el').attr('src') || $('div.vx_el').attr('data-src'),
            thumb: $('div.vx_el').attr('data-poster'),
            desc: $('article > .intro').text(),
            views: $('span.entry-views').text(),
            like: $('span.entry-likes').text(),
            tags: $('article > .post-tags').text()
        };
    });
}

// Ringtone search
function ringtone(title) {
    return axios.get(`https://meloboom.com/en/search/${title}`).then(({ data }) => {
        const $ = cheerio.load(data);
        return $('ul > li').map((_, el) => ({
            title: $(el).find('h4').text(),
            source: 'https://meloboom.com' + $(el).find('a').attr('href'),
            audio: $(el).find('audio').attr('src')
        })).get();
    });
}

// Stylish text generator
function styletext(text) {
    return axios.get(`http://qaz.wtf/u/convert.cgi?text=${encodeURIComponent(text)}`).then(({ data }) => {
        const $ = cheerio.load(data);
        return $('table > tbody > tr').map((_, tr) => ({
            style: $(tr).find('td:nth-child(1) > span').text(),
            result: $(tr).find('td:nth-child(2)').text().trim()
        })).get();
    });
}

module.exports = {
    randomarray,
    wallpaper,
    wikimedia,
    pinterest,
    githubstalk,
    npmstalk,
    ffstalk,
    mlstalk,
    aiovideodl,
    igstalk,
    umma,
    quotesAnime,
    hentai,
    porno,
    ringtone,
    styletext
};
