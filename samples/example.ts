import SSS from '../src'

const testStr = 'test string test test test 測試\0'

const shardArr1 = SSS.split(testStr, 3, 1)
console.log('\n========== Test 1 ==========')
console.log('Shards:', shardArr1)
const combined1 = SSS.combine([shardArr1[0]])
console.log('Combined:', combined1)
console.log('Check if equal to origin:', testStr.localeCompare(combined1))

console.log('\n========== Test 2 ==========')
const shardArr2 = SSS.split(testStr, 3, 2)
console.log('Shards:', shardArr2)
const combined2 = SSS.combine([shardArr2[0], shardArr2[1]])
console.log('Combined:', combined2)
console.log('Check if equal to origin:', testStr.localeCompare(combined2))

console.log('\n========== Test 3 ==========')
const shardArr3 = SSS.split(testStr, 3, 3)
console.log('Shards:', shardArr3)
const combined3 = SSS.combine([shardArr3[0], shardArr3[1], shardArr3[2]])
console.log('Combined:', combined3)
console.log('Check if equal to origin:', testStr.localeCompare(combined3))

console.log('\n========== Test 4 ==========')
const shardArr4 = SSS.split(testStr, 6, 4)
console.log('Shards:', shardArr4)
const combined4 = SSS.combine([
  shardArr4[0],
  shardArr4[2],
  shardArr4[3],
  shardArr4[4],
])
console.log('Combined:', combined4)
console.log('Check if equal to origin:', testStr.localeCompare(combined4))

console.log('\n========== Test 5 ==========')
const shardArr5 = SSS.split(testStr, 6, 5)
console.log('Shards:', shardArr5)
const combined5 = SSS.combine([
  shardArr5[0],
  shardArr5[1],
  shardArr5[2],
  shardArr5[3],
  shardArr5[4],
])
console.log('Combined:', combined5)
console.log('Check if equal to origin:', testStr.localeCompare(combined5))

console.log('\n========== Test 6 ==========')
const shardArr6 = SSS.split(testStr, 6, 6)
console.log('Shards:', shardArr6)
const combined6 = SSS.combine([
  shardArr6[0],
  shardArr6[1],
  shardArr6[2],
  shardArr6[3],
  shardArr6[4],
  shardArr6[5],
])
console.log('Combined:', combined6)
console.log('Check if equal to origin:', testStr.localeCompare(combined6))
