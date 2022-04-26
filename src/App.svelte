<script>
    import { onMount } from "svelte";
    import Page from "./components/Page.svelte";
    import Loader from "./components/Loader.svelte";
    import ErrorPage from "./components/ErrorPage.svelte";
    import { capitalize } from "./utils/utils.js";

    let errorMessage = null;
    let network = null;
    let networkIco = "iota-fav.ico";

    const NETWORK_PARAMS = {
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

  
    onMount(() => {
        void getNetwork();
    });

    const setNetwork = (token) => {
        if (token === "shimmer" || token === "iota") {
            network = token;
            networkIco = `${token}-fav.ico`;
        } else {
            network = "whitelabel";
        }
        setTheme();
    };

    const setTheme = () => {
        if (network === "shimmer") {
            document.body.classList.add("shimmer");
        } else if (network === "iota") {
            document.body.classList.remove("shimmer");
        } else {
            document.body.classList.remove("shimmer");
        }
    };

    const networkDetector = (data) => {
        if (data.tokenName) {
            return data.tokenName.toLowerCase();
        } else {
            if (data.address) {
                if (data.address.indexOf("rms1") === 0) return "shimmer";
                if (data.address.indexOf("atoi1") === 0) return "iota";
            }
        }
        return "whitelabel";
    };

    const getNetwork = async () => {
        // const ENDPOINT = "https://faucet.chrysalis-devnet.iota.cafe/api/plugins/faucet/info";
        //shimmer
        // const ENDPOINT = "https://my.api.mockaroo.com/shimmer?key=aaf534d0"
        //iota
        const ENDPOINT = "https://my.api.mockaroo.com/iota?key=aaf534d0";

        try {
            const res = await fetch(ENDPOINT);
            if (res.status === 200 || res.status === 202) {
                const data = await res.json();
                if (data && data.data)
                    return setNetwork(networkDetector(data.data));
                return (errorMessage =
                    "Something went wrong fetching the network info, try again later.");
            } else if (res.status === 429) {
                errorMessage = "Too many requests. Please, try again later.";
            } else {
                errorMessage = "Something went wrong. Please, try again later.";
            }
        } catch (error) {
            errorMessage = error;
        }
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
                        network === "iota" || network === "shimmer"
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
                {#if errorMessage }
                    <ErrorPage  {errorMessage} />
                {:else if network}
                    <Page networkParams={NETWORK_PARAMS[network]} />
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
