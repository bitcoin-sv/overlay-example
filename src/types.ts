export interface HelloWorldRecord {
  txid: string
  outputIndex: number
  message: string
  createdAt: Date
}

export interface UHRPRecord {
  txid: string
  outputIndex: number
  uhrpURL: string
  retentionPeriod: number
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
  domain: string
  topic: string
  createdAt: Date
}

export interface SLAPRecord {
  txid: string
  outputIndex: number
  identityKey: string
  domain: string
  service: string
  createdAt: Date
}

export interface SHIPQuery {
  domain?: string
  topic?: string
}

export interface SLAPQuery {
  domain?: string
  service?: string
}

export interface TokenQuery {
  txid?: string
  outputIndex?: number
  findAll?: boolean
}

export interface TokenRecord {
  txid: string
  outputIndex: number
  amount: number
  ownerKey: string
  assetId: string
  createdAt: Date
}

export interface UHRPQuery {
  UHRPUrl?: string
  retentionPeriod?: number
}

export interface UtxoQuery {
  txid?: string
  outputIndex?: number
  findAll?: boolean
}

export interface UtxoRecord {
  txid: string
  outputIndex: number
  spent: null | string
}