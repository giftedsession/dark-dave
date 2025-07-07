/**
 * Binary encoding/decoding utilities for 𝐃𝐀𝐕𝐄-𝐗𝐌𝐃
 */

// Decode binary to string
async function dBinary(str) {
    const newBin = str.trim().split(" ");
    const binCode = newBin.map(bin => String.fromCharCode(parseInt(bin, 2)));
    return binCode.join("");
}

// Encode string to binary
async function eBinary(str = '') {
    return str
        .split('')
        .map(char => char.charCodeAt(0).toString(2))
        .join(' ');
}

module.exports = { dBinary, eBinary };
