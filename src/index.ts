import { randomBytes } from 'crypto'

export default class SharmirsSecretSharing {
  private static stdPrime = 4294967389n // smallest prime larger than 2^32
  private static rndInt = (): bigint => {
    return randomBytes(64).readBigUint64BE() % this.stdPrime
  }

  public static split = (
    secret: string,
    totalShards: number,
    threshold: number
  ): string[] => {
    if (threshold <= 0 || totalShards <= 0 || threshold > totalShards) {
      throw new Error('k should be less than total shards')
    }

    const buffer = Buffer.from(secret, 'utf-8')
    const fragShardTable: string[][] = []

    for (let i = 0; i < totalShards; i++) {
      fragShardTable[i] = [
        i.toString(16).padStart(4, '0'),
        threshold.toString(16).padStart(4, '0'),
        (4 - (buffer.byteLength % 4)).toString(),
      ]
    }
    for (let i = 0; i < Math.ceil(buffer.byteLength / 4); i++) {
      let fragment = buffer[i * 4 + 3] || 0
      fragment *= 256
      fragment += buffer[i * 4 + 2] || 0
      fragment *= 256
      fragment += buffer[i * 4 + 1] || 0
      fragment *= 256
      fragment += buffer[i * 4]
      this.splitFrag(fragment, totalShards, threshold).map((shard, j) => {
        fragShardTable[j].push(shard)
      })
    }
    return fragShardTable.map((row) => {
      return row.join('')
    })
  }

  public static combine = (shards: string[]): string => {
    const fragShardTable: { id: number; data: bigint }[][] = []
    let threshold = 0,
      remainder = 0
    shards.forEach((shard) => {
      threshold += Number(`0x${shard.slice(4, 8)}`)
      remainder += Number(shard.slice(8, 9))
    })
    if (shards.length != Math.round(threshold / shards.length)) {
      throw new Error('shard count not equal to threshold')
    }
    shards.slice(0, threshold).forEach((shard) => {
      const index = Number(`0x${shard.slice(0, 4)}`)
      for (let i = 0; i < Math.ceil(shard.length / 8); i++) {
        const fragShard = shard.slice(i * 8 + 9, i * 8 + 17)
        if (!fragShard) {
          break
        }
        if (!fragShardTable[i]) {
          fragShardTable[i] = []
        }
        fragShardTable[i].push({
          id: index + 1,
          data: BigInt(`0x${fragShard}`),
        })
      }
    })
    const buffer = Buffer.from(new Uint8Array(fragShardTable.length * 4))
    fragShardTable.forEach((row, index) => {
      let fragment = this.combineFrag(row)
      buffer[4 * index] = fragment % 256
      fragment /= 256
      buffer[4 * index + 1] = fragment % 256
      fragment /= 256
      buffer[4 * index + 2] = fragment % 256
      fragment /= 256
      buffer[4 * index + 3] = fragment % 256
    })
    return buffer
      .slice(0, buffer.byteLength - Math.round(remainder / shards.length))
      .toString('utf-8')
  }

  private static splitFrag = (
    secret: number,
    n: number,
    k: number
  ): string[] => {
    const coeff = [BigInt(secret)]
    for (let i = 1; i < k; i++) {
      coeff.push(this.rndInt())
    }

    const shards: string[] = []

    for (let i = 1; i <= n; i++) {
      let accum = coeff[0]
      for (let j = 1; j < k; j++) {
        accum =
          (accum +
            ((coeff[j] * (BigInt(i ** j) % this.stdPrime)) % this.stdPrime)) %
          this.stdPrime
      }
      shards.push(accum.toString(16).padStart(8, '0'))
    }
    return shards
  }

  private static combineFrag = (
    shards: { id: number; data: bigint }[]
  ): number => {
    let accum: bigint = 0n,
      start: number,
      next: number
    for (let i = 0; i < shards.length; i++) {
      let numerator = 1n,
        denominator = 1n
      for (let j = 0; j < shards.length; j++) {
        if (i == j) continue
        start = shards[i].id
        next = shards[j].id
        numerator = (numerator * BigInt(-next)) % this.stdPrime
        denominator = (denominator * BigInt(start - next)) % this.stdPrime
      }
      accum =
        (this.stdPrime +
          accum +
          shards[i].data * numerator * this.modInv(denominator)) %
        this.stdPrime
    }
    return Number(accum)
  }

  private static gcd = (a: bigint, b: bigint): bigint[] => {
    if (b == 0n) return [a, 1n, 0n]
    else {
      let n = a / b,
        c = a % b,
        r: bigint[] = this.gcd(b, c)
      return [r[0], r[2], r[1] - r[2] * n]
    }
  }

  private static modInv = (k: bigint): bigint => {
    k = k % this.stdPrime
    let r =
      k < 0 ? -this.gcd(this.stdPrime, -k)[2] : this.gcd(this.stdPrime, k)[2]
    return (this.stdPrime + r) % this.stdPrime
  }
}
