# UHRP Storage

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

#### Class: UHRPStorage

```ts
export class UHRPStorage {
    constructor(private readonly db: Db) 
    async storeRecord(txid: string, outputIndex: number, uhrpURL: string, retentionPeriod: number): Promise<void> 
    async deleteRecord(txid: string, outputIndex: number): Promise<void> 
    async findByUHRPUrl(uhrpURL: string): Promise<UTXOReference[]> 
    async findByRetentionPeriod(retentionPeriod: number): Promise<UTXOReference[]> 
}
```

<details>

<summary>Class UHRPStorage Details</summary>

##### Constructor

Constructs a new UHRPStorage instance

```ts
constructor(private readonly db: Db) 
```

Argument Details

+ **db**
  + connected mongo database instance

##### Method deleteRecord

Delete a matching Signia record

```ts
async deleteRecord(txid: string, outputIndex: number): Promise<void> 
```

Argument Details

+ **txid**
  + transaction id
+ **outputIndex**
  + index of the UTXO

##### Method findByRetentionPeriod

Look up a UHRP record by the retentionPeriod

```ts
async findByRetentionPeriod(retentionPeriod: number): Promise<UTXOReference[]> 
```

##### Method findByUHRPUrl

Finds matching records by identity key, and optional certifiers

```ts
async findByUHRPUrl(uhrpURL: string): Promise<UTXOReference[]> 
```

Returns

returns matching UTXO references

##### Method storeRecord

Stores a new UHRP record

```ts
async storeRecord(txid: string, outputIndex: number, uhrpURL: string, retentionPeriod: number): Promise<void> 
```

Returns

- A promise that resolves when the record is stored

Argument Details

+ **txid**
  + The transaction ID containing the UTXO
+ **outputIndex**
  + The index of the UTXO within the transaction
+ **uhrpURL**
  + The UHRP URL where the content is available for download
+ **retentionPeriod**
  + The retention period for the content, in seconds

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
