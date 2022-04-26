<script>
    export let tokenName = "";
    export let bech32HRP = "";
    
    $: valid = address && address.length > 0;

    let waiting = false;
    let done = false;
    let address = null;
    let success = false;

    let data = null;
    let errorMessage = null;

    async function requestTokens() {
        if (waiting) {
            return false;
        }
        waiting = true;
        let res = null;
        data = null;
        errorMessage = "Sending request...";
        try {
            // const ENDPOINT = "/api/enqueue";
            const ENDPOINT = "https://faucet.chrysalis-devnet.iota.cafe/api/plugins/faucet/info";
            res = await fetch(ENDPOINT, {
                method: "POST",
                mode: 'cors',
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST",
                    Accept: "application/json",
                    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
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
        success = res && res.status === 202;
        done = true;
        waiting = false;
        address = "";
    }
</script>

<div>
    <p class="welcome">Welcome to</p>
    <h1>{tokenName} Faucet</h1>
    <p class="help">
        This service distributes tokens to the requested {tokenName} address.
    </p>
    {#if done}
        <div class="warning">
            {#if success}
                <div>{tokenName} will be sent to your address!</div>
            {:else}
                <div>{errorMessage}</div>
            {/if}
        </div>
    {:else}
        <div class="warning">
            {#if waiting}
                Please wait...
            {:else if valid}
                Click the request button to receive your coins
            {:else}
                Please enter a valid {tokenName} address ({bech32HRP}...)
            {/if}
        </div>
    {/if}
    <div class="iota-input">
        <label for="address">{tokenName} Address</label>
        <input type="text" bind:value={address} disabled={waiting} />
    </div>
    <div class="right">
        <button
            type="button"
            on:click={requestTokens}
            disabled={waiting || !valid}
        >
            Request</button
        >
    </div>
    <div class="illustration-container">
        <img src="./illustration.svg" alt="faucet" class="illustration" />
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
    }

    @media screen and (max-width: 940px) {
        .illustration-container {
            width: 100%;
            position: absolute;
            right: 0;
            top:500px;
        }
    }

    @media screen and (max-width: 480px) {
        .right button {
            display: block;
            width: 100%;
        }
    }

</style>
