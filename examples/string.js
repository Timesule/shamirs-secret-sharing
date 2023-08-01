const crypto = require('crypto');
const { SSS } = require('../lib/index.js');

/* -------------------------------------------------------------------------- */
/*    Splits and combines a secret string with 2/3 Sharmir's Secret Sharing   */
/* -------------------------------------------------------------------------- */

const testString = crypto.randomBytes(1024).toString('utf-8');

const shards = SSS.splitString(testString, 3, 2);

const combined = SSS.combineString(shards.slice(0, 2));

console.log(combined === testString);
