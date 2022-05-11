import SSS from '../src'

const testStr = 'test string test test test 測試\0'
const shards = SSS.split(testStr, 6, 3)
console.log('Shards:', shards)

const combined = SSS.combine([shards[0], shards[2], shards[3], shards[4]])
console.log('Combined:', combined)
console.log('Check if equal to origin:', testStr.localeCompare(combined))
