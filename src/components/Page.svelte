<script>
    export let networkParams;
    $: ({ token, hint } = networkParams);

    let waiting = false;
    let valid = false;
    let done = false;
    let timeout = false;
    let address = "";
    let success = false;

    let data = null;
    let errormsg = null;

    function validate() {
        done = false;
        if (address.length >= 0) {
            valid = true;
        } else {
            valid = false;
            return false;
        }
    }

    async function requestTokens() {
        if (!validate()) return;
        if (waiting) {
            return false;
        }
        waiting = true;
        let res = null;
        data = null;
        errormsg = "Sending request...";

        try {
            res = await fetch(`/api/enqueue`, {
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
                data = await res.json();
                errormsg = "OK";
            } else if (res.status === 429) {
                errormsg = "Too many requests. Try again later!";
            } else {
                data = await res.json();
                errormsg = data.error.message;
            }
        } catch (error) {
            if (error.name === "AbortError") {
                timeout = true;
            }
            errormsg = error;
        }

        success = res && res.status === 202;
        done = true;
        waiting = false;
        address = "";
    }
</script>

<main>
    <p class="welcome">Welcome to</p>
    <h1>{token} Faucet</h1>
    <p class="help">
        This service distributes tokens to the requested {token} address.
    </p>
    {#if done}
        <div class="warning">
            {#if success}
                <div>{token} will be sent to your address!</div>
            {:else}
                <div>{errormsg}</div>
            {/if}
        </div>
    {:else}
        <div class="warning">
            {#if waiting}
                Please wait...
            {:else if valid}
                Click the request button to receive your coins
            {:else}
                Please enter a valid {token} address ({hint})
            {/if}
        </div>
    {/if}
    <div class="iota-input">
        <label for="address">{token} Address</label>
        <input
            type="text"
            bind:value={address}
            on:keyup={validate}
            disabled={waiting}
        />
    </div>
    <div class="right">
        <button
            type="button"
            on:click={requestTokens}
            class:disabled={waiting || !valid}
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
        /* background: var(--box-color); */

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
