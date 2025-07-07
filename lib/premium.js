const fs = require("fs");
const toMs = require("ms");

const PREMIUM_FILE = './src/data/role/premium.json';
const premium = JSON.parse(fs.readFileSync(PREMIUM_FILE));

const savePremium = (_dir) => {
    fs.writeFileSync(PREMIUM_FILE, JSON.stringify(_dir, null, 2));
};

/**
 * Add or extend premium user
 */
const addPremiumUser = (userId, duration, _dir) => {
    const user = _dir.find(u => u.id === userId);
    const now = Date.now();
    const expireMs = toMs(duration);
    if (user) {
        user.expired += expireMs;
    } else {
        _dir.push({ id: userId, expired: now + expireMs });
    }
    savePremium(_dir);
};

/**
 * Get premium user expiration time
 */
const getPremiumExpired = (userId, _dir) => {
    const user = _dir.find(u => u.id === userId);
    return user ? user.expired : null;
};

/**
 * Check if user is premium
 */
const checkPremiumUser = (userId, _dir) => {
    return _dir.some(u => u.id === userId);
};

/**
 * Remove expired premium users every second
 */
const expiredPremiumCheck = (conn, _dir) => {
    setInterval(() => {
        const now = Date.now();
        for (let i = _dir.length - 1; i >= 0; i--) {
            if (now >= _dir[i].expired) {
                const id = _dir[i].id;
                _dir.splice(i, 1);
                savePremium(_dir);
                console.log(`🔻 Premium expired: ${id}`);
                if (id) conn.sendMessage(id, { text: `🔒 Your premium access has expired.` }).catch(() => {});
            }
        }
    }, 1000);
};

/**
 * Get all premium users
 */
const getAllPremiumUser = (_dir) => _dir.map(user => user.id);

module.exports = {
    addPremiumUser,
    getPremiumExpired,
    checkPremiumUser,
    expiredPremiumCheck,
    getAllPremiumUser,
};
