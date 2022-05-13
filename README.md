# Sharmir's Secret Sharing

## Class SharmirsSecretSharing

### Usage

```typescript=
import SSS from 'shamirs-secret-sharing'
```

### Methods

| Name                                  | Description                 |
| ------------------------------------- | --------------------------- |
| split(secret, totalShards, threshold) | split secret into shards    |
| combine(shards)                       | combine shards into secreet |

```
SSS.split(secret, totalShards, threshold): shards
```

**Parameters**
- secret: string
- totalShards: number (number of shards generated)
- threshold: number (number of shards required to reconstruct secret)

**Returns**

- shards: string[]

```
SSS.combine(shards): secret
```

**Parameters**

- shards: string[]

**Returns**

- secret:string
