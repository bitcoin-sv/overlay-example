# SHIP Topic Manager

Links: [API](#api), [Classes](#classes), [Variables](#variables)

### Classes

#### Class: SHIPTopicManager

SHIP Topic Manager
Implements the TopicManager interface for SHIP (Service Host Interconnect Protocol) tokens.

The SHIP Topic Manager identifies admissible outputs based on SHIP protocol requirements.
SHIP tokens facilitate the advertisement of nodes hosting specific topics within the overlay network.

```ts
export class SHIPTopicManager implements TopicManager {
    async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> 
    async getDocumentation(): Promise<string> {
        return `
    SHIP Topic Manager:
    
    The SHIP (Service Host Interconnect Protocol) topic manager is responsible for managing SHIP tokens within the overlay network. SHIP tokens are used to advertise the availability of service hosts and their associated topics, facilitating decentralized service discovery.

    Functions:
    - Extracts and validates SHIP token fields.
    - Verifies the advertiser's identity using the BRC-31 identity key.
    - Ensures correct derivation of the locking key using BRC-42 with BRC-43 formatted invoice numbers.
    - Validates the token signature with the derived public key.
    - Admits valid SHIP tokens into the SHIP topic for network-wide visibility.

    The SHIP topic manager ensures the integrity and authenticity of service advertisements, playing a crucial role in decentralized service discovery and interconnectivity.
  `;
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

<summary>Class SHIPTopicManager Details</summary>

##### Method getDocumentation

Returns documentation specific to the SHIP topic manager.

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

Identifies admissible outputs for SHIP tokens.

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
