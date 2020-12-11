require('dotenv').config();

async function run() {
    const { AccountManager, StorageType, SignerType } = require('iota-wallet')
    const manager = new AccountManager({
        storagePath: './faucet-database',
        storageType: StorageType.Sqlite
    })
    
    const mnemonic = process.env.IOTA_WALLET_MNEMONIC
    
    const account = await manager.createAccount({
      mnemonic,
      alias: 'Faucet pool',
      clientOptions: { node: process.env.NODE_URL, localPow: false },
      signerType: SignerType.EnvMnemonic
    })

    console.log('alias', account.alias())
    console.log('balance', account.availableBalance())

    const synced = await account.sync({})

    console.log('synced', synced)
    console.log('acc messages', account.listMessages())
    console.log('acc spent addresses', account.listAddresses(false))
    console.log('acc unspent addresses', account.listAddresses(true))

    console.log('All good! You can now run the faucet');
}

run()
