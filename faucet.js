require('dotenv').config();

async function run() {
    const { AccountManager, StorageType } = require('iota-wallet')
    const manager = new AccountManager({
        storagePath: './faucet-database',
        storageType: StorageType.Sqlite
    })

    //const account_id = process.env.STRONGHOLD_ACCOUNT_ID.split(',').map(Number);
    console.log(manager.getAccounts())
    const account = manager.getAccountByAlias('Faucet pool')

    console.log('alias', account.alias())
    console.log('available balance', account.availableBalance())
    //console.log('total balance', account.totalBalance())
    console.log('syncing...')
    
    const synced = await account.sync({})

    //console.log('Account messages: ', account.listMessages())
    const addresses = account.listAddresses(true)
    let unspent_addr = '';
    if(addresses.length == 0) {
        unspent_addr = account.generateAddress().address
    } else {
        unspent_addr = addresses[0].address
    }
    console.log('Need a refill? Send it this address:', unspent_addr)
    
    const s_addresses = account.listAddresses(false)
    console.log(s_addresses)

    // Webserver part

    const express = require('express')
    const rateLimit = require('express-rate-limit')
    const app = express()
    const port = process.env.PORT || 3000
    const secs = parseInt(process.env.RATE_LIMIT_SECONDS || 300)
    const amount = parseInt(process.env.TOKENS_TO_SEND || 1000)

    const limiter = rateLimit({
        windowMs: 1000 * secs,
        max: 1,
        skipFailedRequests: true,
        message: {'message': `You can only request tokens from the faucet once every ${secs} seconds.`}
    });
    
    app.use(express.static('frontend/public'))
    app.use('/api', limiter);

    app.get('/api', async (req, res) => {

        if(!req.query.address || req.query.address.length != 63) {
            res.status(400);
            res.send({'message': 'Invalid address provided!'})
            return;
        }
        
        const node_res = await synced.send(req.query.address, amount);
        res.send({'message': 'Faucet tokens sent!', 'data': node_res})
    });

    app.listen(port, () => {
        console.log(`Faucet server running on port ${port}`)
    });
}

run()
