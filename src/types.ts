export interface HelloWorldRecord {
  txid: string
  outputIndex: number
  message: string
  createdAt: Date
}

export interface UTXOReference {
  txid: string
  outputIndex: number
}

export interface SHIPRecord {
  txid: string
  outputIndex: number
  identityKey: string
  domainName: string
  topicName: string
  createdAt: Date
}

export interface SLAPRecord {
  txid: string
  outputIndex: number
  identityKey: string
  domainName: string
  serviceName: string
  createdAt: Date
}

export interface SHIPQuery {
  domainName?: string
  topicName?: string
}

export interface SLAPQuery {
  domainName?: string
  serviceName?: string
}
