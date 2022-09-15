<script>
  import { bech32 } from "bech32";
  import { ERROR_MESSAGES } from "../lib/constants.js";

  export let tokenName;
  export let bech32Hrp;
  export let illustration = "whitelabel-illustration.svg";

  $: valid = isValidBench32Address(address);

  let isWaiting = false;
  let isDone = false;
  let address = null;
  let hasSucceeded = false;

  let errorMessage = null;

  function isValidBench32Address(_address) {
    if (!_address || !bech32Hrp) {
      return false;
    } else {
      try {
        const decodedAddress = bech32.decode(_address);
        return decodedAddress && decodedAddress.prefix === bech32Hrp;
      } catch(e) {
        return false;
      }
    }
  }

  async function requestTokens() {
    if (isWaiting) {
      return false;
    }
    isWaiting = true;
    let response = null;
    let data = null;
    errorMessage = ERROR_MESSAGES.SENDING_REQUEST;
    try {
      const FAUCET_ENDPOINT = "api/enqueue";

      response = await fetch(FAUCET_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
        }),
      });
      if (response.status === 202) {
        errorMessage = ERROR_MESSAGES.OK;
      } else if (response.status === 429) {
        errorMessage = ERROR_MESSAGES.TOO_MANY_REQUESTS;
      } else {
        data = await response.json();
        errorMessage = data.error.message;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        timeout = true;
      }
      errorMessage = error;
    }
    hasSucceeded = response && response.status === 202;
    isDone = true;
    isWaiting = false;
    address = "";
  }
</script>

<div>
  <p class="welcome">Welcome to</p>
  <h1>{tokenName} Faucet</h1>
  <p class="help">
    This service distributes tokens to the requested {tokenName} address.
  </p>
  {#if isDone}
    <div class="warning">
      {#if hasSucceeded}
        <div>{tokenName} will be sent to your address!</div>
      {:else}
        <div>{errorMessage}</div>
      {/if}
    </div>
  {:else}
    <div class="warning">
      {#if isWaiting}
        Please wait...
      {:else if valid}
        Click the request button to receive your coins
      {:else}
        Please enter a valid {tokenName} address ({bech32Hrp}1...)
      {/if}
    </div>
  {/if}
  <div class="iota-input">
    <label for="address">{tokenName} Address</label>
    <input type="text" bind:value={address} disabled={isWaiting} />
  </div>
  <div class="right">
    <button
      type="button"
      on:click={requestTokens}
      disabled={isWaiting || !valid}
    >
      Request</button
    >
  </div>
  <div class="illustration-container">
    <img src="./{illustration}" alt="faucet" class="illustration" />
  </div>
</div>

<style>
  .right {
    text-align: right;
  }

  .help {
    font-size: 13px;
    color: #9aadce;
    line-height: 160%;
    font-weight: 400;
    margin-top: 1em;
    margin-bottom: 2em;
  }

  .warning {
    font-size: 12px;
    color: var(--primary-text-color);
    background-color: var(--box-color);
    border-radius: 8px;
    padding: 10px 20px;
    margin-top: 1em;
    word-break: break-word;
  }

  .welcome {
    color: var(--primary-color);
    text-transform: uppercase;
    font-size: 14px;
    margin: 0;
  }

  .iota-input {
    width: 100%;
    padding: 0;
    position: relative;
    background: var(--bg-color);
    margin-top: 10px;
  }

  .iota-input label {
    font-size: 10px;
    line-height: 12px;
    color: #9aadce;
    position: absolute;
    top: 7px;
    left: 20px;
  }
  .iota-input input {
    width: 100%;
    border: none;
    padding: 20px 20px 10px;
    border: solid 1px var(--border-color);
    border-radius: 10px;
    margin: 0;
    outline: none;
    font-size: 12px;
    color: var(--primary-text-color);
    background-color: var(--bg-color);
  }

  .illustration-container {
    width: 45%;
    position: absolute;
    right: 0;
    top: 100px;
  }

  .illustration {
    max-width: 100%;
    width: 100%;
    max-height: calc(100vh - 150px);
  }

  @media screen and (max-width: 940px) {
    .illustration-container {
      width: 100%;
      position: absolute;
      right: 0;
      top: 500px;
    }
  }

  @media screen and (max-width: 480px) {
    .right button {
      display: block;
      width: 100%;
    }
  }
</style>
