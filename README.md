# IOTA Chrysalis Faucet

This faucet allows you to hand out IOTA (Chrysalis phase 2) tokens to users requesting it.

## Install

`npm install`

Copy `.env.example` to `.env` and fill in the variables; Make sure you have a valid and backed up 24-word mnemonic as a seed.

Now run the initialization first, once:

`node initialize`

After this is succesful you created your Wallet account and you are ready to start the faucet.

`node faucet`

Note: the frontend is already served by faucet.js once it synced, you don't need to run it seperately.
You just need to `npm build` inside frontend if you make any changes to it.
