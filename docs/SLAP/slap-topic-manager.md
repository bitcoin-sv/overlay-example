# SLAP Topic Manager

Links: [API](#api), [Classes](#classes), [Variables](#variables)

### Classes

#### Class: SLAPTopicManager

SLAP Topic Manager
Implements the TopicManager interface for SLAP (Service Lookup Availability Protocol) tokens.

The SLAP Topic Manager identifies admissible outputs based on SLAP protocol requirements.
SLAP tokens facilitate the advertisement of lookup services availability within the overlay network.

```ts
export class SLAPTopicManager implements TopicManager {
    async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> 
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

<summary>Class SLAPTopicManager Details</summary>

##### Method getDocumentation

Returns documentation specific to the SLAP topic manager.

```ts
async getDocumentation(): Promise<string> 
```

Returns

A promise that resolves to the documentation string.

##### Method getMetaData

Returns metadata associated with this topic manager.

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

##### Method identifyAdmissibleOutputs

Identifies admissible outputs for SLAP tokens.

```ts
async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> 
```

Returns

A promise that resolves with the admittance instructions.

Argument Details

+ **beef**
  + The transaction data in BEEF format.
+ **previousCoins**
  + The previous coins to consider.

</details>

Links: [API](#api), [Classes](#classes), [Variables](#variables)

---
### Variables

| |
| --- |
| [isValidDomain](#variable-isvaliddomain) |
| [isValidServiceName](#variable-isvalidservicename) |
| [verifyToken](#variable-verifytoken) |

Links: [API](#api), [Classes](#classes), [Variables](#variables)

---

#### Variable: verifyToken

```ts
verifyToken = (identityKey: string, lockingPublicKey: string, fields: Buffer[], signature: string, protocolId: string): void => {
    const expectedPublicKey = getPaymentAddress({
        senderPrivateKey: process.env.SERVER_PRIVATE_KEY,
        recipientPublicKey: identityKey,
        invoiceNumber: `2-${protocolId}-1`,
        returnType: "publicKey"
    });
    if (expectedPublicKey !== lockingPublicKey) {
        throw new Error("Invalid locking key!");
    }
    const pubKey = PublicKey.fromString(lockingPublicKey);
    const hasValidSignature = pubKey.verify(Array.from(Buffer.concat(fields)), Signature.fromDER(signature, "hex"));
    if (!hasValidSignature)
        throw new Error("Invalid signature!");
}
```

Links: [API](#api), [Classes](#classes), [Variables](#variables)

---
#### Variable: isValidDomain

```ts
isValidDomain = (domain: string): boolean => {
    const domainRegex = /^(https?:\/\/)?((([a-zA-Z0-9-]+)\.)+([a-zA-Z]{2,})|localhost(:[0-9]+))(\/.*)?$/;
    return domainRegex.test(domain);
}
```

Links: [API](#api), [Classes](#classes), [Variables](#variables)

---
#### Variable: isValidServiceName

```ts
isValidServiceName = (service: string): boolean => {
    const serviceRegex = /^(?!_)(?!.*__)[a-z_]{1,50}(?<!_)$/;
    return serviceRegex.test(service);
}
```

Links: [API](#api), [Classes](#classes), [Variables](#variables)

---
