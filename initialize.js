require('dotenv').config();

async function run() {
    const { AccountManager, StorageType, SignerType } = require('iota-wallet')
    const manager = new AccountManager({
        storagePath: './faucet-database',
        storageType: StorageType.Sqlite
    })
    manager.setStrongholdPassword(process.env.STRONGHOLD_PASSWORD)
    manager.storeMnemonic(SignerType.Stronghold, process.env.IOTA_WALLET_MNEMONIC)
    
    const account = await manager.createAccount({
      alias: 'Faucet pool',
      clientOptions: { nodes: [process.env.NODE_URL], localPow: false, network: 'testnet4' }
    })
    console.log('account', account)

    console.log('alias', account.alias())

    const synced = await account.sync({})

    console.log('synced', synced)
    console.log('acc messages', account.listMessages())
    console.log('acc spent addresses', account.listAddresses(false))
    console.log('acc unspent addresses', account.listAddresses(true))

    console.log('All good! You can now run the faucet');
}

run()
