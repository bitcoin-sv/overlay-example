# SHIP Lookup Service

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
| [SHIPLookupService](#class-shiplookupservice) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---


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
#### Class: SHIPLookupService

Implements the SHIP lookup service

The SHIP lookup service allows querying for overlay services hosting specific topics
within the overlay network.

```ts
export class SHIPLookupService implements LookupService {
    constructor(public storage: SHIPStorage) 
    async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> 
    async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> 
    async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> 
    async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> 
    async getDocumentation(): Promise<string> {
        return `The SHIP (Service Host Interconnect Protocol) lookup service allows overlay services
    to advertise their hosting of specific topics within the overlay network.
    This service helps in the discovery of services that host specific topics,
    enabling efficient synchronization and communication across the overlay network.

    Key functionalities of the SHIP lookup service include:
    - Output Addition: When a new output is added to the SHIP topic, the service
      processes the output script to decode and validate the SHIP token fields. 
      The fields include the SHIP identifier, the identity key of the advertiser,
      the domain name of the service host, and the topic name being hosted.
    - Output Removal: Handles the removal of outputs from the SHIP topic by 
      deleting the corresponding records from the storage.
    - Querying Advertisements: Allows querying of the SHIP service to discover
      services hosting specific topics. This is crucial for peer discovery and network
      robustness.
    - Validation: Ensures the authenticity of the advertisements by validating
      the BRC-48 locking key and the signature using the identity key and derived
      public key.

    The SHIP lookup service is compliant with the BRC-23 standard, ensuring that
    the advertisements and peer discovery mechanisms adhere to the defined protocols
    and security requirements.`;
    }
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

<summary>Class SHIPLookupService Details</summary>

##### Method getDocumentation

Returns documentation specific to this overlay lookup service.

```ts
async getDocumentation(): Promise<string> 
```

Returns

A promise that resolves to the documentation string.

##### Method getMetaData

Returns metadata associated with this lookup service.

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

A promise that resolves to an object containing metadata.

##### Method lookup

Answers a lookup query.

```ts
async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> 
```

Returns

A promise that resolves to a lookup answer or formula.

Argument Details

+ **question**
  + The lookup question to be answered.

##### Method outputAdded

Handles the addition of a new output to the topic.

```ts
async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID containing the output.
+ **outputIndex**
  + The index of the output in the transaction.
+ **outputScript**
  + The script of the output to be processed.
+ **topic**
  + The topic associated with the output.

##### Method outputDeleted

Handles the deletion of an output in the topic.

```ts
async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID of the deleted output.
+ **outputIndex**
  + The index of the deleted output.
+ **topic**
  + The topic associated with the deleted output.

##### Method outputSpent

Handles the spending of an output in the topic.

```ts
async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID of the spent output.
+ **outputIndex**
  + The index of the spent output.
+ **topic**
  + The topic associated with the spent output.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes)

---
