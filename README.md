# Sharmir's Secret Sharing 
[![Nodejs CI](https://github.com/Timesule/shamirs-secret-sharing/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/Timesule/shamirs-secret-sharing/actions/workflows/nodejs-ci.yml)
[![NPM CD](https://github.com/Timesule/shamirs-secret-sharing/actions/workflows/npm-cd.yml/badge.svg)](https://github.com/Timesule/shamirs-secret-sharing/actions/workflows/npm-cd.yml)

Implementation of Sharmir's Secret Sharing in Typescript

### Installation

```bash
npm i @timesule/shamirs-secret-sharing
```

### Usage

```javascript
const { SSS } = require('../lib/index.js');
// or
const { ShamirsSecretSharing } = require('../lib/index.js');
```

```typescript
import { SSS } from 'shamirs-secret-sharing';
// or
import { ShamirsSecretSharing } from 'shamirs-secret-sharing';
```

Check [examples/\*](./examples/) for more information

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
