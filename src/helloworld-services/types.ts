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