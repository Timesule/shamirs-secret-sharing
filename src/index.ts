import { randomBytes } from 'crypto'

export default class ShamirsSecretSharing {
  /* -------------------------------------------------------------------------- */
  /*                                  Variables                                 */
  /* -------------------------------------------------------------------------- */

  private static stdPrime = 4294967389n // Smallest prime larger than 2^32
  private static FOUR_BYTES = 4
  private static HEX_BASE = 16
  private static BYTE_LENGTH = 256

  /* -------------------------------------------------------------------------- */
  /*                              Wrapper Functions                             */
  /* -------------------------------------------------------------------------- */

  /**
   * Splits a secret string into shards.
   * @param {string} secret The secret to be split.
   * @param {number} totalShards The total number of shards.
   * @param {number} threshold The minimum number of shards required to reconstruct the secret.
   * @returns {string[]} An array of shards.
   */
  public static splitString(
    secret: string,
    totalShards: number,
    threshold: number
  ): string[] {
    return this.splitBuffer(
      Buffer.from(secret, 'utf-8'),
      totalShards,
      threshold
    )
  }

  /**
   * Combines shards into the original secret string.
   * @param {string[]} shards The shards to be combined.
   * @returns {string} The original secret.
   */
  public static combineString(shards: string[]): string {
    return this.combineBuffer(shards).toString('utf-8')
  }

  /**
   * Splits a secret buffer into shards.
   * @param {Buffer} secretBuffer The buffer containing the secret to be split.
   * @param {number} totalShards The total number of shards.
   * @param {number} threshold The minimum number of shards required to reconstruct the secret.
   * @returns {string[]} An array of shards.
   */
  public static splitBuffer(
    secretBuffer: Buffer,
    totalShards: number,
    threshold: number
  ): string[] {
    if (totalShards <= 0 || totalShards >= 65536) {
      throw new Error(
        'Number of shards should be positive, and less than 65536.'
      )
    }
    if (threshold <= 0 || threshold > totalShards) {
      throw new Error(
        'Threshold should be positive, and less than or equal to the total number of shards.'
      )
    }

    const buffer = secretBuffer
    const fragShardTable: string[][] = new Array(totalShards)
    const bufferLength = Math.ceil(buffer.byteLength / this.FOUR_BYTES)

    const thresholdHex = threshold.toString(this.HEX_BASE).padStart(4, '0')
    const padding = (
      this.FOUR_BYTES -
      (buffer.byteLength % this.FOUR_BYTES)
    ).toString()

    // Initialize the shard table
    for (let i = 0; i < totalShards; i++) {
      fragShardTable[i] = [
        i.toString(this.HEX_BASE).padStart(4, '0'),
        thresholdHex,
        padding,
      ]
    }

    // Process the buffer and split fragments
    for (let i = 0; i < bufferLength; i++) {
      let fragment = 0
      for (let j = this.FOUR_BYTES - 1; j >= 0; j--) {
        fragment =
          fragment * this.BYTE_LENGTH + (buffer[i * this.FOUR_BYTES + j] || 0)
      }

      this.splitFrag(fragment, totalShards, threshold).forEach((shard, j) => {
        fragShardTable[j].push(shard)
      })
    }

    return fragShardTable.map((row) => row.join(''))
  }

  /**
   * Combines shards into the original secret buffer.
   * @param {string[]} shards The shards to be combined.
   * @returns {Buffer} The original secret as a buffer.
   */
  public static combineBuffer(shards: string[]): Buffer {
    const fragShardTable: { id: number; data: bigint }[][] = []
    let threshold = 0,
      remainder = 0
    const shardCount = shards.length

    // Process the shards
    shards.forEach((shard) => {
      threshold += Number(`0x${shard.slice(4, 8)}`)
      remainder += Number(shard.slice(8, 9))
    })
    threshold = Math.round(threshold / shardCount)

    if (shardCount < threshold) {
      throw new Error('Shard count less than threshold.')
    }

    // Organize the shards into a table
    shards.slice(0, shards.length).forEach((shard) => {
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

    // Create the buffer
    const buffer = Buffer.from(
      new Uint8Array(fragShardTable.length * this.FOUR_BYTES)
    )

    // Combine fragments
    fragShardTable.forEach((row, index) => {
      let fragment = this.combineFrag(row)
      buffer[4 * index] = fragment % this.BYTE_LENGTH
      fragment /= this.BYTE_LENGTH
      buffer[4 * index + 1] = fragment % this.BYTE_LENGTH
      fragment /= this.BYTE_LENGTH
      buffer[4 * index + 2] = fragment % this.BYTE_LENGTH
      fragment /= this.BYTE_LENGTH
      buffer[4 * index + 3] = fragment % this.BYTE_LENGTH
    })

    return buffer.slice(
      0,
      buffer.byteLength -
        (Math.round(remainder / shards.length) % this.FOUR_BYTES)
    )
  }

  /* -------------------------------------------------------------------------- */
  /*                               Core Functions                               */
  /* -------------------------------------------------------------------------- */

  /**
   * Splits a fragment of the secret into shards.
   * @private
   * @param {number} secret The secret fragment.
   * @param {number} n Total number of shards.
   * @param {number} k Threshold.
   * @returns {string[]} An array of shards.
   */
  private static splitFrag = (
    secret: number,
    n: number,
    k: number
  ): string[] => {
    const coeff: bigint[] = [BigInt(secret)]
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
      shards.push(accum.toString(this.HEX_BASE).padStart(8, '0'))
    }
    return shards
  }

  /**
   * Combines a fragment of the shards into a number.
   * @private
   * @param {Array<{ id: number, data: bigint }>} shards The shards to be combined.
   * @returns {number} The combined fragment as a number.
   */
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
      while (accum < 0n) {
        accum += this.stdPrime
      }
    }

    return Number(accum)
  }

  /* -------------------------------------------------------------------------- */
  /*                              Utility Functions                             */
  /* -------------------------------------------------------------------------- */

  /**
   * Generates a random integer within the range of the standard prime.
   * @returns {bigint} A random integer.
   */
  private static rndInt = (): bigint => {
    return randomBytes(64).readBigUInt64BE() % this.stdPrime
  }

  /**
   * Computes the greatest common divisor.
   * @private
   * @param {bigint} a First number.
   * @param {bigint} b Second number.
   * @returns {bigint[]} An array containing the GCD and Bezout coefficients.
   */
  private static gcd = (a: bigint, b: bigint): bigint[] => {
    if (b == 0n) {
      return [a, 1n, 0n]
    } else {
      let n = a / b,
        c = a % b,
        r: bigint[] = this.gcd(b, c)
      return [r[0], r[2], r[1] - r[2] * n]
    }
  }

  /**
   * Computes the modular inverse.
   * @private
   * @param {bigint} k The number for which the modular inverse is to be found.
   * @returns {bigint} The modular inverse.
   */
  private static modInv = (k: bigint): bigint => {
    k = k % this.stdPrime
    let r =
      k < 0 ? -this.gcd(this.stdPrime, -k)[2] : this.gcd(this.stdPrime, k)[2]
    return (this.stdPrime + r) % this.stdPrime
  }
}
