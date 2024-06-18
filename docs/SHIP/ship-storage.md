# SHIP Storage

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

### Interfaces

| |
| --- |
| [HelloWorldRecord](#interface-helloworldrecord) |
| [SHIPQuery](#interface-shipquery) |
| [SHIPRecord](#interface-shiprecord) |
| [SLAPQuery](#interface-slapquery) |
| [SLAPRecord](#interface-slaprecord) |
| [UHRPQuery](#interface-uhrpquery) |
| [UHRPRecord](#interface-uhrprecord) |
| [UTXOReference](#interface-utxoreference) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---

#### Interface: HelloWorldRecord

```ts
export interface HelloWorldRecord {
    txid: string;
    outputIndex: number;
    message: string;
    createdAt: Date;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
#### Interface: UHRPRecord

```ts
export interface UHRPRecord {
    txid: string;
    outputIndex: number;
    uhrpURL: string;
    retentionPeriod: number;
    createdAt: Date;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
#### Interface: UTXOReference

```ts
export interface UTXOReference {
    txid: string;
    outputIndex: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
#### Interface: SHIPRecord

```ts
export interface SHIPRecord {
    txid: string;
    outputIndex: number;
    identityKey: string;
    domain: string;
    topic: string;
    createdAt: Date;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
#### Interface: SLAPRecord

```ts
export interface SLAPRecord {
    txid: string;
    outputIndex: number;
    identityKey: string;
    domain: string;
    service: string;
    createdAt: Date;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
#### Interface: SHIPQuery

```ts
export interface SHIPQuery {
    domain?: string;
    topic?: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
#### Interface: SLAPQuery

```ts
export interface SLAPQuery {
    domain?: string;
    service?: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
#### Interface: UHRPQuery

```ts
export interface UHRPQuery {
    UHRPUrl?: string;
    retentionPeriod?: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
### Classes

#### Class: SHIPStorage

Implements a storage engine for SHIP protocol

```ts
export class SHIPStorage {
    constructor(private readonly db: Db) 
    async ensureIndexes(): Promise<void> 
    async storeSHIPRecord(txid: string, outputIndex: number, identityKey: string, domain: string, topic: string): Promise<void> 
    async deleteSHIPRecord(txid: string, outputIndex: number): Promise<void> 
    async findRecord(query: {
        domain?: string;
        topic?: string;
    }): Promise<UTXOReference[]> 
}
```

<details>

<summary>Class SHIPStorage Details</summary>

##### Constructor

Constructs a new SHIPStorage instance

```ts
constructor(private readonly db: Db) 
```

Argument Details

+ **db**
  + connected mongo database instance

##### Method deleteSHIPRecord

Deletes a SHIP record

```ts
async deleteSHIPRecord(txid: string, outputIndex: number): Promise<void> 
```

Argument Details

+ **txid**
  + transaction id
+ **outputIndex**
  + index of the UTXO

##### Method ensureIndexes

Ensures the necessary indexes are created for the collections.

```ts
async ensureIndexes(): Promise<void> 
```

##### Method findRecord

Finds SHIP records based on a given query object.

```ts
async findRecord(query: {
    domain?: string;
    topic?: string;
}): Promise<UTXOReference[]> 
```

Returns

returns matching UTXO references

Argument Details

+ **query**
  + The query object which may contain properties for domain or topic.

##### Method storeSHIPRecord

Stores a SHIP record

```ts
async storeSHIPRecord(txid: string, outputIndex: number, identityKey: string, domain: string, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + transaction id
+ **outputIndex**
  + index of the UTXO
+ **identityKey**
  + identity key
+ **domain**
  + domain name
+ **topic**
  + topic name

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
