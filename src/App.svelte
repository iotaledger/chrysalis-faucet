<script>
    let waiting = false;
    let valid = false;
    let done = false;
    let timeout = false;
    let address = "";
    let faucetInfo;
    let success = false;
    let data = null;

    function validate(event) {
        done = false;
        if (address.length == 64 && address.indexOf("atoi1") === 0) {
            valid = true;
        } else {
            valid = false;
        }
    }

    async function requestTokens(_event) {
        if (waiting) {
            return false;
        }
        waiting = true;
        let res = "Sending request...";

        try {
            res = await fetch(`/api/plugins/faucet/enqueue`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address: address,
                }),
            });
            data = await res.json();
        } catch (error) {
            if (error.name === "AbortError") {
                timeout = true;
            }
        }

        success = res && res.status === 202;
        done = true;
        waiting = false;
        address = "";
    }

    setInterval(function () {
        requestFaucetInfo();
    }, 10000);

    async function requestFaucetInfo() {
        let res = null;
        try {
            res = await fetch("/api/plugins/faucet/info");
            let data = await res.json();
            faucetInfo = data.data;
        } catch (error) {
            if (error.name === "AbortError") {
                timeout = true;
            }
        }
    }
</script>

<main>
    <p class="welcome">Welcome to</p>
    <h1>IOTA Faucet</h1>
    <p class="help">
        This service distributes tokens to the requested IOTA address.
    </p>
    {#if typeof faucetInfo != "undefined"}
        <div class="faucetInfo">Faucet info:</div>
        <div class="faucetInfo">Address: {faucetInfo.address}</div>
        <div class="faucetInfo">Balance: {faucetInfo.balance}</div>
    {/if}
    {#if done}
        <div class="warning">
            {#if success}
                <div>IOTA will be sent</div>
            {:else}
                {"Eror:" + JSON.stringify(data)}
                {setTimeout(() => {
                    done = false;
                }, 5000)}
            {/if}
        </div>
    {:else}
        <div class="warning">
            {#if waiting}
                Please wait...
            {:else if valid}
                Click the request button to receive your coins
            {:else}
                Please enter a valid IOTA address (atoi1...)
            {/if}
        </div>
    {/if}
    <div class="iota-input">
        <label for="address">IOTA Address</label>
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
            class:disabled={waiting || !valid}>Request</button
        >
    </div>
</main>

<style>
    main {
        margin-left: 10%;
    }

    .right {
        text-align: right;
    }

    .right button {
        background: #108cff;
        cursor: pointer;
        border-radius: 10px;
        padding: 15px 50px;
        color: #fff;
        font-size: 13px;
        margin: 20px 0 50px;
        border: none;
    }

    .right button.disabled {
        opacity: 0.5;
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
        color: #25395f;
        background: #f6f9ff;
        border-radius: 8px;
        padding: 10px 20px;
        margin-top: 1em;
        word-break: break-word;
    }

    .welcome {
        color: #108cff;
        text-transform: uppercase;
        font-size: 14px;
        margin: 0;
    }

    h1 {
        color: #25395f;
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
        background: #fff;
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
        background: #fff;
        font-size: 12px;
    }

    .faucetInfo {
        font-size: 13px;
        color: rgb(108, 122, 148);
        font-weight: 400;
    }
</style>
