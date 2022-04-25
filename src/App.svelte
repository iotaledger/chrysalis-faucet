<script>
    import { onMount } from "svelte";

    import Page from "./components/Page.svelte";
    import Loader from "./components/Loader.svelte";
    import ErrorPage from "./components/ErrorPage.svelte";
    import { capitalize } from "./utils/utils.js";
    let errorMessage = null;

    let network = null;
    let networkIco = "iota-fav.ico";
    const setNetwork = (token) => {
        if (token === "shimmer" || token === "iota") {
            network = token;
            networkIco = `${token}-fav.ico`;
        } else {
            network = "whitelabel";
        }
        setTheme(token);
    };

    const setTheme = (token) => {
        if (token === "shimmer") {
            document.body.classList.add("shimmer");
        } else if (token === "iota") {
            document.body.classList.remove("shimmer");
        } else {
            document.body.classList.remove("shimmer");
        }
    };

    const networkDetector = (data) => {
        if (data.tokenName) {
            return data.tokenName.toLowerCase();
        } else {
            if (data.address.indexOf("rms1") === 0) return "shimmer";
            if (data.address.indexOf("atoi1") === 0) return "iota";
        }
        return "whitelabel"
    };

    const getNetwork = async () => {
        // setTimeout(() => {
        //     return setNetwork("shimmer");
        // }, 2000);

        const endpoint =
            "https://faucet.alphanet.iotaledger.net/api/plugins/faucet/v1/info";
        try {
            const res = await fetch(endpoint);

            if (res.status === 200) {
                const data = await res.json();
                // setTimeout(() => {
                // errorMessage = "Could not obtain the network from the node.";
                // }, 2000);

                return setNetwork(networkDetector(data));
            } else if (res.status === 429) {
                errorMessage = "Too many requests. Try again later!";
            }
        } catch (error) {
            if (error.name === "AbortError") {
                timeout = true;
            }
            errorMessage = error;
        }
    };
    onMount(async () => {
        getNetwork();
    });

    const networkParams = {
        shimmer: {
            token: "Shimmer",
            hint: "rms1...",
        },
        iota: {
            token: "IOTA",
            hint: "atoi1...",
        },
        whitelabel: {
            token: "Whitelabel",
            hint: "wlab1...",
        },
    };
</script>

<svelte:head>
    <title>{capitalize(network || "iota")} Faucet</title>
    <link rel="icon" type="image/png" href={networkIco} />
</svelte:head>
<main>
    <div class="content">
        <div class="row">
            <div class="col-xs-12">
                <img
                    src={`./${
                        network == "iota" || network == "shimmer"
                            ? network
                            : "iota"
                    }.svg`}
                    class="logo"
                    alt="IOTA"
                />
            </div>
        </div>

        <div class="row contentrow">
            <div class="col-lg-4">
                {#if errorMessage}
                    <ErrorPage {errorMessage} />
                {:else if network}
                    <Page networkParams={networkParams[network]} />
                {:else}
                    <Loader />
                {/if}
            </div>
        </div>
    </div>
</main>

<style>
    main {
        background-color: var(--bg-color);
        min-width: 100vw;
        min-height: 100vh;
    }
</style>
