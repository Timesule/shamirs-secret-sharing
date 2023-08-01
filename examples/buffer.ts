import crypto from 'crypto';
import { SSS } from '../lib/index';

/* -------------------------------------------------------------------------- */
/*    Splits and combines a secret buffer with 2/3 Sharmir's Secret Sharing   */
/* -------------------------------------------------------------------------- */

const testBuffer = crypto.randomBytes(1024);

const shards = SSS.splitBuffer(testBuffer, 3, 2);

const combined = SSS.combineBuffer(shards.slice(0, 2));

console.log(combined.equals(testBuffer));
