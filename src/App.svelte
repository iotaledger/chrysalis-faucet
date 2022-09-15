<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { Error, Faucet, Loader } from "./components";
  import {
    ERROR_MESSAGES,
    IOTA_BENCH32HRP,
    IOTA_TOKEN_NAME,
    KNOWN_NETWORK_PARAMS,
    SHIMMER_BENCH32HRP,
    SHIMMER_TOKEN_NAME,
  } from "./lib/constants.js";

  let errorMessage = null;
  let tokenName = null;
  let bech32Hrp = null;

  $: detectedNetworkDefaultParams = KNOWN_NETWORK_PARAMS.find(
    (networkParams) =>
      tokenName &&
      tokenName.toLowerCase() === networkParams.tokenName.toLowerCase()
  );
  $: logo =
    detectedNetworkDefaultParams && detectedNetworkDefaultParams.logo
      ? detectedNetworkDefaultParams.logo
      : null;
  $: favicon =
    detectedNetworkDefaultParams && detectedNetworkDefaultParams.favicon
      ? detectedNetworkDefaultParams.favicon
      : null;
  $: illustration =
    detectedNetworkDefaultParams && detectedNetworkDefaultParams.illustration
      ? detectedNetworkDefaultParams.illustration
      : "whitelabel-illustration.svg";

  onMount(() => {
    void getNetwork();
  });

  const getNetwork = async () => {
    const NODE_ENDPOINT = "api/info";    

    try {
      const res = await fetch(NODE_ENDPOINT);
      if (res.status === 200 || res.status === 202) {
        const response = await res.json();
        if (response) {
          const data = response.data ? response.data : response;
          return setNetworkData(data);
        }
        return (errorMessage = ERROR_MESSAGES.NODE_FETCHING_ERROR);
      } else if (res.status === 429) {
        return (errorMessage = ERROR_MESSAGES.TOO_MANY_REQUESTS);
      } else {
        return (errorMessage = ERROR_MESSAGES.NODE_FETCHING_ERROR);
      }
    } catch (error) {
      console.error(error);
      errorMessage = error;
    }
  };

  const setNetworkData = (data = {}) => {
    if (data.tokenName) {
      if (data.tokenName.toLowerCase() === IOTA_TOKEN_NAME.toLowerCase()) {
        tokenName = data.tokenName ? data.tokenName : IOTA_TOKEN_NAME;
        bech32Hrp = data.bech32Hrp ? data.bech32Hrp : IOTA_BENCH32HRP;
        document.body.classList.add("iota");
      } else if (data.tokenName.toLowerCase() === SHIMMER_TOKEN_NAME.toLowerCase()) {
        tokenName = data.tokenName ? data.tokenName : SHIMMER_TOKEN_NAME;
        bech32Hrp = data.bech32Hrp ? data.bech32Hrp : SHIMMER_BENCH32HRP;
        document.body.classList.add("shimmer");
      } else {
        tokenName = data.tokenName ? data.tokenName : "Foo Bar";
        bech32Hrp = data.bech32Hrp ? data.bech32Hrp : "foo1";
      }
    } else {
      errorMessage = ERROR_MESSAGES.NODE_FETCHING_ERROR;
    }
  };
</script>

<svelte:head>
  <title>{tokenName ? `${tokenName} ` : ""}Faucet</title>
  {#if favicon}
    <link rel="icon" type="image/png" href={`./${favicon}`} />
  {/if}
</svelte:head>

<div>
  <div class="content">
    <div class="row">
      <div class="col-xs-12">
        {#if logo}
          <img src={logo} class="logo" alt={tokenName} />
        {/if}
      </div>
    </div>
    <div class="row contentrow">
      <div class="col-lg-4">
        <main>
          {#if errorMessage}
            <div in:fade>
              <Error {errorMessage} />
            </div>
          {:else if tokenName && bech32Hrp}
            <div in:fade>
              <Faucet bech32Hrp={bech32Hrp} {tokenName} {illustration} />
            </div>
          {:else}
            <div in:fade>
              <Loader />
            </div>
          {/if}
        </main>
      </div>
    </div>
  </div>
</div>

<style>
  main {
    background-color: var(--bg-color);
    margin-left: 10%;
    max-width: 380px;
    transition: max-width 1s;
  }

  @media screen and (max-width: 940px) {
    main {
      margin-left: 0;
      max-width: none;
    }
  }

  @media screen and (min-width: 1140px) {
    main {
      max-width: 480px;
    }
  }

  .logo {
    height: 64px;
  }
</style>
