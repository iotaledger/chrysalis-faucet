<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { Error, Faucet, Loader } from "./components";

    const IOTA_BENCH32HRP = "atoi1"
    const IOTA_TOKEN_NAME = "IOTA"
    const SHIMMER_BENCH32HRP = "rms1"
    const SHIMMER_TOKEN_NAME = "Shimmer"

    const KNOWN_NETWORK_PARAMS = [
        {
            tokenName: IOTA_TOKEN_NAME,
            bech32HRP: IOTA_BENCH32HRP,
            logo: 'iota.svg',
            favicon: 'iota-fav.ico',
        },
        {
            tokenName: SHIMMER_TOKEN_NAME,
            bech32HRP: SHIMMER_BENCH32HRP,
            logo: 'shimmer.svg',
            favicon: 'shimmer-fav.ico',
        },
    ]

    let errorMessage = null;
    let tokenName = null;
    let bech32HRP = null;

    $: knownNetworkParams = KNOWN_NETWORK_PARAMS.find((networkParams) => networkParams.bech32HRP === bech32HRP);
    $: logo = knownNetworkParams ? knownNetworkParams.logo : null
    $: favicon = knownNetworkParams ? knownNetworkParams.favicon : null

    onMount(() => {
        void getNetwork();
    });

    const getNetwork = async () => {
        // const ENDPOINT = "/api/info";
        // const ENDPOINT = "https://faucet.alphanet.iotaledger.net/api/plugins/faucet/v1/info";
        const ENDPOINT = "https://faucet.chrysalis-devnet.iota.cafe/api/plugins/faucet/info";

        try {
            const res = await fetch(ENDPOINT);
            if (res.status === 200 || res.status === 202) {
                const response = await res.json();
                if (response) {
                    const data = response.data ? response.data : response;
                    return setNetworkData(data);
                }
                return (errorMessage =
                    "Something went wrong fetching the network info. Please, try again later.");
            } else if (res.status === 429) {
                errorMessage = "Too many requests. Please, try again later.";
            } else {
                errorMessage = "Something went wrong. Please, try again later.";
            }
        } catch (error) {
            console.error(error);
            errorMessage = error;
        }
    };

    const setNetworkData = (data = {}) => {
        if (data.address) {
            if (data.address.indexOf(IOTA_BENCH32HRP) === 0) {
                tokenName = data.tokenName ? data.tokenName : IOTA_TOKEN_NAME;
                bech32HRP = data.bech32HRP ? data.bech32HRP : IOTA_BENCH32HRP;
                document.body.classList.add("iota");
            } else if (data.address.indexOf(SHIMMER_BENCH32HRP) === 0) {
                tokenName = data.tokenName ? data.tokenName : SHIMMER_TOKEN_NAME;
                bech32HRP = data.bech32HRP ? data.bech32HRP : SHIMMER_BENCH32HRP;
                document.body.classList.add("shimmer");
            } else {
                tokenName = data.tokenName ? data.tokenName : 'Foo Bar';
                bech32HRP = data.bech32HRP ? data.bech32HRP : 'foo1';
            }
        } else {
            errorMessage = "Something went wrong fetching the network info. Please, try again later.";
        }
    };
</script>

<svelte:head>
    <title>{tokenName ? `${tokenName} ` : ''}Faucet</title>
    {#if favicon}
        <link rel="icon" type="image/png" href={favicon} />
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
                    {#if errorMessage }
                        <div in:fade>
                            <Error {errorMessage} />
                        </div>
                    {:else if tokenName && bech32HRP}
                        <div in:fade>
                            <Faucet {bech32HRP} {tokenName} />
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
