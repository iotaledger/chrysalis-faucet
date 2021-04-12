require('dotenv').config();

async function run() {
	const { AccountManager, StorageType, RemainderValueStrategy, initLogger } = require('@iota/wallet')
    const manager = new AccountManager({
        storagePath: './faucet-database',
        storageType: StorageType.Sqlite
    })

    initLogger({
      color_enabled: true,
      outputs: [{
        name: './faucet.log',
        level: 'debug'
      }]
    })

    manager.setStrongholdPassword(process.env.STRONGHOLD_PASSWORD)

    console.log(manager.getAccounts())
    const account = manager.getAccount('Faucet pool')

    console.log('alias', account.alias())
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
    
    app.set('trust proxy', true);
    app.use(express.static('frontend/public'))
    app.use('/api', limiter);

    app.get('/api', async (req, res) => {
        
        console.log('API called by ', req.ip, req.ips);
        if(!req.query.address || req.query.address.length != 64 || req.query.address.indexOf('atoi1') !== 0) {
            res.status(400);
            res.send({'message': 'Invalid address provided!'})
            return;
        }
        
        try {
            manager.setStrongholdPassword(process.env.STRONGHOLD_PASSWORD)
            const node_res = await account.send(
                req.query.address,
                amount, 
                {
                    remainderValueStrategy: RemainderValueStrategy.reuseAddress(),
                    indexation: {
                        index: 'FAUCET'
                    }
                }
            );
            console.log(node_res);
            res.send({'message': 'Faucet tokens sent!', 'data': node_res})
        } catch (e) {
            console.log('ERROR', e);
            res.status(503);
            res.send({'message': 'Out of service, please try again later', 'error': e})
            return;
        }
    });

    app.listen(port, () => {
        console.log(`Faucet server running on port ${port}`)
    });
}

run()
