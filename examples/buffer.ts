import crypto from 'crypto'
import SSS from '../src'

const testBuffer = crypto.randomBytes(1024)

const shards = SSS.splitBuffer(testBuffer, 3, 2)

const combined = SSS.combineBuffer(shards.slice(0, 2))

console.log(combined.equals(testBuffer))
