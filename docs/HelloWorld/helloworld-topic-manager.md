# HelloWorld Topic Manager

Links: [API](#api), [Classes](#classes)

### Classes

#### Class: HelloWorldTopicManager

Note: The PushDrop package is used to decode BRC-48 style Pay-to-Push-Drop tokens.

```ts
export class HelloWorldTopicManager implements TopicManager {
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

<summary>Class HelloWorldTopicManager Details</summary>

##### Method getDocumentation

Get the documentation associated with this topic manager

```ts
async getDocumentation(): Promise<string> 
```

Returns

A promise that resolves to a string containing the documentation

##### Method getMetaData

Get metadata about the topic manager

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

##### Method identifyAdmissibleOutputs

Identify if the outputs are admissible depending on the particular protocol requirements

```ts
async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> 
```

Returns

A promise that resolves with the admittance instructions

Argument Details

+ **beef**
  + The transaction data in BEEF format
+ **previousCoins**
  + The previous coins to consider

</details>

Links: [API](#api), [Classes](#classes)

---
