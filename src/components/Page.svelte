<script>
  import { fade } from "svelte/transition";

  export let networkParams = {};

  $: ({ token, hint } = networkParams);
  $: hasValidAddress = address && address.length > 0;

  let isWaiting = false;
  let isDone = false;
  let address = null;
  let hasSucceeded = false;

  let errorMessage = null;

  async function requestTokens() {
    if (isWaiting) {
      return (errorMessage = "Sending request...");
    }

    isWaiting = true;
    let res = null;
    let data = null;

    const FAUCET_ENDPOINT = "/api/enqueue";

    try {
      res = await fetch(FAUCET_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
        }),
      });
      if (res.status === 202) {
        errorMessage = "OK";
      } else if (res.status === 429) {
        errorMessage = "Too many requests. Try again later!";
      } else {
        data = await res.json();
        errorMessage = data.error.message;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        timeout = true;
      }
      errorMessage = error;
    }
    hasSucceeded = res && res.status === 202;
    isDone = true;
    isWaiting = false;
    address = "";
  }
</script>

<main in:fade>
  <p class="welcome">Welcome to</p>
  <h1>{token} Faucet</h1>
  <p class="help">
    This service distributes tokens to the requested {token} address.
  </p>
  {#if isDone}
    <div class="warning">
      {#if hasSucceeded}
        <div>{token} will be sent to your address!</div>
      {:else}
        <div>{errorMessage}</div>
      {/if}
    </div>
  {:else}
    <div class="warning">
      {#if isWaiting}
        Please wait...
      {:else if hasValidAddress}
        Click the request button to receive your coins
      {:else}
        Please enter a valid {token} address ({hint})
      {/if}
    </div>
  {/if}
  <div class="iota-input">
    <label for="address">{token} Address</label>
    <input type="text" bind:value={address} disabled={isWaiting} />
  </div>
  <div class="right">
    <button
      type="button"
      on:click={requestTokens}
      class:disabled={isWaiting || !hasValidAddress}
    >
      Request</button
    >
  </div>
  <div class="illustration-container">
    <img src="./illustration.svg" alt="faucet" class="illustration" />
  </div>
</main>

<style>
  main {
    margin-left: 10%;
  }

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
    color: var(--title-color);
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

  h1 {
    color: var(--title-color);
    font-size: 32px;
    font-family: "DMBold", sans-serif;
    letter-spacing: 1px;
    font-weight: 700;
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
    border: solid 1px #d8e3f5;
    border-radius: 10px;
    margin: 0;
    outline: none;
    background: var(--box-color);
    font-size: 12px;
    color: var(--title-color);
  }
</style>
