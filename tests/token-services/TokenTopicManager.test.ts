import { TokenTopicManager } from '../../src/token-services/TokenTopicManager'
import pushdrop from 'pushdrop'
import { Transaction, PrivateKey, LockingScript, UnlockingScript } from '@bsv/sdk'

// Example private key for signing transactions
const randomKey = PrivateKey.fromWif('L5EY1SbTvvPNSdCYQe1EJHfXCBBT4PmnF6CDbzCm9iifZptUvDGB')

describe('TokenTopicManager', () => {
  let manager: TokenTopicManager

  beforeEach(() => {
    manager = new TokenTopicManager()
  })

  it('Admits issuance output', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = sourceTransaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: []
    })
  })


  it('should identify admissible outputs and retain coins', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            `${sourceTransaction.id('hex')}.0`,
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: [0]
    })
  })

  it('should handle new asset issuance correctly', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const newAssetTransaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = newAssetTransaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: []
    })
  })

  it('should return documentation for the topic manager', async () => {
    const doc = await manager.getDocumentation()
    expect(doc).toContain('Tokens')
    expect(doc).toContain('UTXO-based protocol on top of PushDrop')
  })

  it('should return metadata for the topic manager', async () => {
    const meta = await manager.getMetaData()
    expect(meta).toEqual({
      name: 'TokenTopicManager',
      shortDescription: 'A topic manager for token transactions.',
      iconURL: 'https://example.com/icon.png',
      version: '1.0.0',
      informationURL: 'https://example.com/info'
    })
  })

  it('Admits issuance output with metadata', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '100',
            'metadata_1'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = sourceTransaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: []
    })
  })

  it('Redeems an issuance output', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            `${sourceTransaction.id('hex')}.0`,
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: [0]
    })
  })


  it('Redeems an issuance output with metadata', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '100',
            'metadata_1'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            `${sourceTransaction.id('hex')}.0`,
            '100',
            'metadata_1'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: [0]
    })
  })

  it('Will not redeem issuance output if metadata changes', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '100',
            'metadata_1'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            `${sourceTransaction.id('hex')}.0`,
            '100',
            'metadata_changed'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [],
      coinsToRetain: []
    })
  })

  it('Does not redeem issuance output when amount is too large', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            `${sourceTransaction.id('hex')}.0`,
            '101'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [],
      coinsToRetain: []
    })
  })

  it('Redeems a non-issuance output', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: [0]
    })
  })


  it('Redeems a non-issuance output with metadata', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '100',
            'metadata_1'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '100',
            'metadata_1'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: [0]
    })
  })


  it('Will not redeem non-issuance output when metadata changes', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '100',
            'metadata_1'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            `${sourceTransaction.id('hex')}.0`,
            '100',
            'metadata_changed'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [],
      coinsToRetain: []
    })
  })

  it('Does not admit non-issuance outputs when amounts are too large', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            `${sourceTransaction.id('hex')}.0`,
            '101'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [],
      coinsToRetain: []
    })
  })

  it('Splits an asset into two outputs', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '75'
          ]
        })),
        satoshis: 1000
      },
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '25'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [0, 1],
      coinsToRetain: [0]
    })
  })


  it('Will not split for more than the original amount, only letting the first outputs through', async () => {
    const sourceTransaction = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '75'
          ]
        })),
        satoshis: 1000
      },
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid.0',
            '35'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: [0]
    })
  })


  it('Merges two tokens of the same asset into one output', async () => {
    const sourceTransaction1 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const sourceTransaction2 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid',
            '150'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction: sourceTransaction1,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction1.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      },
      {
        sourceTransaction: sourceTransaction2,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction2.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid',
            '250'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0, 1])

    expect(admitted).toEqual({
      outputsToAdmit: [0],
      coinsToRetain: [0, 1]
    })
  })



  it('Does not merge two different assets into one output', async () => {
    const sourceTransaction1 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid1.0',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const sourceTransaction2 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_assid2.0',
            '150'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction: sourceTransaction1,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction1.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      },
      {
        sourceTransaction: sourceTransaction2,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction2.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            `${sourceTransaction1.id('hex')}.0`,
            '250'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()

    const admitted = await manager.identifyAdmissibleOutputs(beef, [0, 1])

    expect(admitted).toEqual({
      outputsToAdmit: [],
      coinsToRetain: []
    })
  })

  it('Splits one asset, merges a second, issues a third, and transfers a fourth, all in the same transaction', async () => {
    const sourceTransaction1 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_split',
            '100'
          ]
        })),
        satoshis: 1000
      }
    ])

    const sourceTransaction2 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_merge',
            '150'
          ]
        })),
        satoshis: 1000
      }
    ])

    const sourceTransaction3 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_merge',
            '150'
          ]
        })),
        satoshis: 1000
      }
    ])

    const sourceTransaction4 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_transfer',
            '150'
          ]
        })),
        satoshis: 1000
      }
    ])

    const sourceTransaction5 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_transfer',
            '150'
          ]
        })),
        satoshis: 1000
      }
    ])

    const sourceTransaction6 = new Transaction(1, [], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_burnme',
            '1'
          ]
        })),
        satoshis: 1000
      }
    ])

    const transaction = new Transaction(1, [
      {
        sourceTransaction: sourceTransaction1,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction1.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      },
      {
        sourceTransaction: sourceTransaction2,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction2.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      },
      {
        sourceTransaction: sourceTransaction3,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction3.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      },
      {
        sourceTransaction: sourceTransaction4,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction4.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      },
      {
        sourceTransaction: sourceTransaction5,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction5.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      },
      {
        sourceTransaction: sourceTransaction6,
        sourceOutputIndex: 0,
        sourceTXID: sourceTransaction6.id('hex'),
        unlockingScript: UnlockingScript.fromHex(''),
        sequence: 0xffffffff
      }
    ], [
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_split',
            '75'
          ]
        })),
        satoshis: 1000
      },
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_split',
            '25'
          ]
        })),
        satoshis: 1000
      },
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_merge',
            '300'
          ]
        })),
        satoshis: 1000
      },
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'ISSUE',
            '500'
          ]
        })),
        satoshis: 1000
      },
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_transfer',
            '250'
          ]
        })),
        satoshis: 1000
      },
      {
        lockingScript: LockingScript.fromHex(await pushdrop.create({
          key: randomKey.toWif(),
          fields: [
            'mock_transfer',
            '50'
          ]
        })),
        satoshis: 1000
      }
    ])

    const beef = transaction.toBEEF()
    const admitted = await manager.identifyAdmissibleOutputs(beef, [0, 1, 2, 3, 4, 5])

    expect(admitted).toEqual({
      outputsToAdmit: [0, 1, 2, 3, 4, 5],
      coinsToRetain: [0, 1, 2, 3, 4] // Remember, these are input indexes!
    })
  })
})
