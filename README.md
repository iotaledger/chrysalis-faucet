# IOTA Chrysalis Faucet

This faucet allows you to hand out IOTA (Chrysalis phase 2) tokens to users requesting it.

## Install

`npm install`

Note: You need to have the node bindings for wallet.rs installed and linked as well; For instructions on
how to do this from source go to https://github.com/iotaledger/wallet.rs/tree/develop/bindings/node

Copy `.env.example` to `.env` and fill in the variables; Make sure you have a valid and backed up 24-word mnemonic as a seed.

Now run the initialization first, once:

`node initialize`

After this is succesful you created your Wallet account and you are ready to start the faucet.

`node faucet`

Note: the frontend is already served by faucet.js once it synced, you don't need to run it seperately.
You just need to `npm build` inside frontend if you make any changes to it.

## Docker
```bash
docker build . -t chrysalis-faucet
docker run -it -v $(pwd)/.env:/app/.env -p 80:80 -p 3000:3000 chrysalis-faucet
```

By mounting the `.env` file, you can edit it from the host filesystem and those changes will be mirrored inside the container
