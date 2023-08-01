import crypto from 'crypto'
import SSS from '../src'

const testString = crypto.randomBytes(1024).toString('utf-8')

const shards = SSS.splitString(testString, 3, 2)

const combined = SSS.combineString(shards.slice(0, 2))

console.log(combined === testString)
