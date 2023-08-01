"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSS = exports.ShamirsSecretSharing = void 0;
const crypto_1 = require("crypto");
class ShamirsSecretSharing {
    static splitString(secret, totalShards, threshold) {
        return this.splitBuffer(Buffer.from(secret, 'utf-8'), totalShards, threshold);
    }
    static combineString(shards) {
        return this.combineBuffer(shards).toString('utf-8');
    }
    static splitBuffer(secretBuffer, totalShards, threshold) {
        if (totalShards <= 0 || totalShards >= 65536) {
            throw new Error('Number of shards should be positive, and less than 65536.');
        }
        if (threshold <= 0 || threshold > totalShards) {
            throw new Error('Threshold should be positive, and less than or equal to the total number of shards.');
        }
        const buffer = secretBuffer;
        const fragShardTable = new Array(totalShards);
        const bufferLength = Math.ceil(buffer.byteLength / this.FOUR_BYTES);
        const thresholdHex = threshold.toString(this.HEX_BASE).padStart(4, '0');
        const padding = (this.FOUR_BYTES -
            (buffer.byteLength % this.FOUR_BYTES)).toString();
        for (let i = 0; i < totalShards; i++) {
            fragShardTable[i] = [
                i.toString(this.HEX_BASE).padStart(4, '0'),
                thresholdHex,
                padding,
            ];
        }
        for (let i = 0; i < bufferLength; i++) {
            let fragment = 0;
            for (let j = this.FOUR_BYTES - 1; j >= 0; j--) {
                fragment =
                    fragment * this.BYTE_LENGTH + (buffer[i * this.FOUR_BYTES + j] || 0);
            }
            this.splitFrag(fragment, totalShards, threshold).forEach((shard, j) => {
                fragShardTable[j].push(shard);
            });
        }
        return fragShardTable.map((row) => row.join(''));
    }
    static combineBuffer(shards) {
        const fragShardTable = [];
        let threshold = 0, remainder = 0;
        const shardCount = shards.length;
        shards.forEach((shard) => {
            threshold += Number(`0x${shard.slice(4, 8)}`);
            remainder += Number(shard.slice(8, 9));
        });
        threshold = Math.round(threshold / shardCount);
        if (shardCount < threshold) {
            throw new Error('Shard count less than threshold.');
        }
        shards.slice(0, shards.length).forEach((shard) => {
            const index = Number(`0x${shard.slice(0, 4)}`);
            for (let i = 0; i < Math.ceil(shard.length / 8); i++) {
                const fragShard = shard.slice(i * 8 + 9, i * 8 + 17);
                if (!fragShard) {
                    break;
                }
                if (!fragShardTable[i]) {
                    fragShardTable[i] = [];
                }
                fragShardTable[i].push({
                    id: index + 1,
                    data: BigInt(`0x${fragShard}`),
                });
            }
        });
        const buffer = Buffer.from(new Uint8Array(fragShardTable.length * this.FOUR_BYTES));
        fragShardTable.forEach((row, index) => {
            let fragment = this.combineFrag(row);
            buffer[4 * index] = fragment % this.BYTE_LENGTH;
            fragment /= this.BYTE_LENGTH;
            buffer[4 * index + 1] = fragment % this.BYTE_LENGTH;
            fragment /= this.BYTE_LENGTH;
            buffer[4 * index + 2] = fragment % this.BYTE_LENGTH;
            fragment /= this.BYTE_LENGTH;
            buffer[4 * index + 3] = fragment % this.BYTE_LENGTH;
        });
        return buffer.slice(0, buffer.byteLength -
            (Math.round(remainder / shards.length) % this.FOUR_BYTES));
    }
}
exports.ShamirsSecretSharing = ShamirsSecretSharing;
_a = ShamirsSecretSharing;
ShamirsSecretSharing.stdPrime = 4294967389n;
ShamirsSecretSharing.FOUR_BYTES = 4;
ShamirsSecretSharing.HEX_BASE = 16;
ShamirsSecretSharing.BYTE_LENGTH = 256;
ShamirsSecretSharing.splitFrag = (secret, n, k) => {
    const coeff = [BigInt(secret)];
    for (let i = 1; i < k; i++) {
        coeff.push(_a.rndInt());
    }
    const shards = [];
    for (let i = 1; i <= n; i++) {
        let accum = coeff[0];
        for (let j = 1; j < k; j++) {
            accum =
                (accum +
                    ((coeff[j] * (BigInt(i ** j) % _a.stdPrime)) % _a.stdPrime)) %
                    _a.stdPrime;
        }
        shards.push(accum.toString(_a.HEX_BASE).padStart(8, '0'));
    }
    return shards;
};
ShamirsSecretSharing.combineFrag = (shards) => {
    let accum = 0n, start, next;
    for (let i = 0; i < shards.length; i++) {
        let numerator = 1n, denominator = 1n;
        for (let j = 0; j < shards.length; j++) {
            if (i == j)
                continue;
            start = shards[i].id;
            next = shards[j].id;
            numerator = (numerator * BigInt(-next)) % _a.stdPrime;
            denominator = (denominator * BigInt(start - next)) % _a.stdPrime;
        }
        accum =
            (_a.stdPrime +
                accum +
                shards[i].data * numerator * _a.modInv(denominator)) %
                _a.stdPrime;
        while (accum < 0n) {
            accum += _a.stdPrime;
        }
    }
    return Number(accum);
};
ShamirsSecretSharing.rndInt = () => {
    return (0, crypto_1.randomBytes)(64).readBigUInt64BE() % _a.stdPrime;
};
ShamirsSecretSharing.gcd = (a, b) => {
    if (b == 0n) {
        return [a, 1n, 0n];
    }
    else {
        let n = a / b, c = a % b, r = _a.gcd(b, c);
        return [r[0], r[2], r[1] - r[2] * n];
    }
};
ShamirsSecretSharing.modInv = (k) => {
    k = k % _a.stdPrime;
    let r = k < 0 ? -_a.gcd(_a.stdPrime, -k)[2] : _a.gcd(_a.stdPrime, k)[2];
    return (_a.stdPrime + r) % _a.stdPrime;
};
exports.SSS = ShamirsSecretSharing;
