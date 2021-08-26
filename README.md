# IOTA Chrysalis Faucet

This faucet allows you to hand out IOTA (Chrysalis phase 2) tokens to users requesting it.

It is directly hosted by the HORNET faucet plugin.

## Prerequisites

To deploy your own version of the Faucet, you need to have at least [version 14 of Node.js](https://nodejs.org/en/download/) installed on your device.

To check if you have Node.js installed, run the following command:

```bash
node -v
```

If Node.js is installed, you should see the version that's installed.

# Getting Started

You need to run a local version of the Hornet node software from the main branch [https://github.com/gohornet/hornet/](https://github.com/gohornet/hornet/)

1. Make sure to enable the faucet plugin and the set the `faucet.website.enabled` to true in Hornet config, to enable the node to serve the website.
2. Install all needed npm modules via `npm install`.
3. Build the project by running `npm run build` within the repo root directory.
4. Run `packr2` within the repo root directory.
5. Build and start hornet.
6. Using default port config, you should now be able to access the dashboard under http://127.0.0.1:8091
