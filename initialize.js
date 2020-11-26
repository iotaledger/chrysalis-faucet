require('dotenv').config();

async function run() {
    
    if(process.env.STRONGHOLD_ACCOUNT_ID) {
        console.log('Stronghold Account ID already set, seems like you already initialized');
        process.exit(1);
    }

    const { AccountManager } = require('iota-wallet')
    const manager = new AccountManager('./faucet-database')
    manager.setStrongholdPassword(process.env.STRONGHOLD_PASSWORD)
    
    const mnemonic = process.env.SEED_MNEMONIC
    
    const account = await manager.createAccount({
      mnemonic,
      alias: 'Faucet pool',
      clientOptions: { node: 'https://api.hornet01.alphanet.iota.cafe/' }
    })

    console.log('alias', account.alias())
    console.log('balance', account.availableBalance())

    const synced = await account.sync({})

    console.log('synced', synced)
    console.log('acc messages', account.listMessages())
    console.log('acc spent addresses', account.listAddresses(false))
    console.log('acc unspent addresses', account.listAddresses(true))

    console.log('All good! You can now run the faucet after removing the SEED_MNEMONIC from .env');
}

run()
