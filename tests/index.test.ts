import crypto from 'crypto'
import SSS from '../src'

const testString = crypto.randomBytes(1024).toString('utf-8')
const testBuffer = crypto.randomBytes(1024)

describe(`SSS`, () => {
  it('should be able to split and combine strings', async () => {
    expect(
      SSS.combineString(SSS.splitString(testString, 3, 1).slice(0, 1))
    ).toStrictEqual(testString)
    expect(
      SSS.combineString(SSS.splitString(testString, 3, 2).slice(0, 2))
    ).toStrictEqual(testString)
    expect(
      SSS.combineString(SSS.splitString(testString, 3, 3).slice(0, 3))
    ).toStrictEqual(testString)
    expect(
      SSS.combineString(SSS.splitString(testString, 6, 4).slice(1, 5))
    ).toStrictEqual(testString)
    expect(
      SSS.combineString(SSS.splitString(testString, 6, 5).slice(1, 6))
    ).toStrictEqual(testString)
    expect(SSS.combineString(SSS.splitString(testString, 6, 6))).toStrictEqual(
      testString
    )
  })

  it('should be able to split and combine buffers', async () => {
    expect(
      SSS.combineBuffer(SSS.splitBuffer(testBuffer, 3, 1).slice(0, 1))
    ).toStrictEqual(testBuffer)
    expect(
      SSS.combineBuffer(SSS.splitBuffer(testBuffer, 3, 2).slice(0, 2))
    ).toStrictEqual(testBuffer)
    expect(
      SSS.combineBuffer(SSS.splitBuffer(testBuffer, 3, 3).slice(0, 3))
    ).toStrictEqual(testBuffer)
    expect(
      SSS.combineBuffer(SSS.splitBuffer(testBuffer, 6, 4).slice(1, 5))
    ).toStrictEqual(testBuffer)
    expect(
      SSS.combineBuffer(SSS.splitBuffer(testBuffer, 6, 5).slice(1, 6))
    ).toStrictEqual(testBuffer)
    expect(SSS.combineBuffer(SSS.splitBuffer(testBuffer, 6, 6))).toStrictEqual(
      testBuffer
    )
  })

  it('should catch invalid shard count errors', async () => {
    expect(() => SSS.splitString(testString, -1, 1)).toThrowError(
      'Number of shards should be positive, and less than 65536.'
    )
    expect(() => SSS.splitBuffer(testBuffer, 65537, 1)).toThrowError(
      'Number of shards should be positive, and less than 65536.'
    )
  })

  it('should catch invalid threshold errors', async () => {
    expect(() => SSS.splitString(testString, 3, -1)).toThrowError(
      'Threshold should be positive, and less than or equal to the total number of shards.'
    )
    expect(() => SSS.splitBuffer(testBuffer, 3, 4)).toThrowError(
      'Threshold should be positive, and less than or equal to the total number of shards.'
    )
  })

  it('should catch insufficient shards for threshold', async () => {
    expect(() =>
      SSS.combineString(SSS.splitString(testString, 3, 2).slice(0, 1))
    ).toThrowError('Shard count less than threshold.')
    expect(() =>
      SSS.combineBuffer(SSS.splitBuffer(testBuffer, 3, 2).slice(0, 1))
    ).toThrowError('Shard count less than threshold.')
  })
})
