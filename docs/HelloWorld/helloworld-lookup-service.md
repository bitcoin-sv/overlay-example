# HelloWorld Lookup Service

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

| |
| --- |
| [HelloWorldLookupService](#class-helloworldlookupservice) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---


```ts
export class HelloWorldStorage {
    constructor(private readonly db: Db) 
    async storeRecord(txid: string, outputIndex: number, message: string): Promise<void> 
    async deleteRecord(txid: string, outputIndex: number): Promise<void> 
    async findByMessage(message: string): Promise<UTXOReference[]> 
}
```

<details>

<summary>Class HelloWorldStorage Details</summary>

##### Constructor

Constructs a new SigniaStorageEngine instance

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

##### Method findByMessage

Finds matching records by identity key, and optional certifiers

```ts
async findByMessage(message: string): Promise<UTXOReference[]> 
```

Returns

returns matching UTXO references

##### Method storeRecord

Stores record of certification

```ts
async storeRecord(txid: string, outputIndex: number, message: string): Promise<void> 
```

Argument Details

+ **txid**
  + transaction id
+ **outputIndex**
  + index of the UTXO
+ **message**
  + hello world message to save

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
#### Class: HelloWorldLookupService

Implements an example HelloWorld lookup service

Note: The PushDrop package is used to decode BRC-48 style Pay-to-Push-Drop tokens.

```ts
export class HelloWorldLookupService implements LookupService {
    constructor(public storage: HelloWorldStorage) 
    async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> 
    async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> 
    async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> 
    async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> 
    async getDocumentation(): Promise<string> 
    async getMetaData(): Promise<{
        name: string;
        shortDescription: string;
        iconURL?: string;
        version?: string;
        informationURL?: string;
    }> 
}
```

<details>

<summary>Class HelloWorldLookupService Details</summary>

##### Constructor

Constructs a new HelloWorldLookupService instance

```ts
constructor(public storage: HelloWorldStorage) 
```

Argument Details

+ **storage**
  + The storage instance to use for managing records

##### Method getDocumentation

Returns documentation specific to this overlay lookup service

```ts
async getDocumentation(): Promise<string> 
```

Returns

A promise that resolves to the documentation string

##### Method getMetaData

Returns metadata associated with this lookup service

```ts
async getMetaData(): Promise<{
    name: string;
    shortDescription: string;
    iconURL?: string;
    version?: string;
    informationURL?: string;
}> 
```

Returns

A promise that resolves to an object containing metadata

Throws

An error indicating the method is not implemented

##### Method lookup

Answers a lookup query

```ts
async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> 
```

Returns

A promise that resolves to a lookup answer or formula

Argument Details

+ **question**
  + The lookup question to be answered

##### Method outputAdded

Notifies the lookup service of a new output added.

```ts
async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> 
```

Returns

A promise that resolves when the processing is complete.

Argument Details

+ **txid**
  + The transaction ID containing the output.
+ **outputIndex**
  + The index of the output in the transaction.
+ **outputScript**
  + The script of the output to be processed.
+ **topic**
  + The topic associated with the output.

Throws

Will throw an error if there is an issue with storing the record in the storage engine.

##### Method outputDeleted

Notifies the lookup service that an output has been deleted

```ts
async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID of the deleted output
+ **outputIndex**
  + The index of the deleted output
+ **topic**
  + The topic associated with the deleted output

##### Method outputSpent

Notifies the lookup service that an output was spent

```ts
async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID of the spent output
+ **outputIndex**
  + The index of the spent output
+ **topic**
  + The topic associated with the spent output

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
