# Sharmir's Secret Sharing

### Installation

```bash
npm install
```

### Usage

```typescript=
import SSS from 'shamirs-secret-sharing'
```

Check examples/\* for more information

- `examples/string.ts`: split secret string
- `examples/buffer.ts`: split secret buffer

## Class SharmirsSecretSharing

### `splitString`

Splits a secret string into shards.

#### Parameters

- `secret` (string): The secret to be split.
- `totalShards` (number): The total number of shards.
- `threshold` (number): The minimum number of shards required to reconstruct the secret.

#### Returns

- (string[]): An array of shards.

### `combineString`

Combines shards into the original secret string.

#### Parameters

- `shards` (string[]): The shards to be combined.

#### Returns

- (string): The original secret.

### `splitBuffer`

Splits a secret buffer into shards.

#### Parameters

- `secretBuffer` (Buffer): The buffer containing the secret to be split.
- `totalShards` (number): The total number of shards.
- `threshold` (number): The minimum number of shards required to reconstruct the secret.

#### Returns

- (string[]): An array of shards.

### `combineBuffer`

Combines shards into the original secret buffer.

#### Parameters

- `shards` (string[]): The shards to be combined.

#### Returns

- (Buffer): The original secret as a buffer.
