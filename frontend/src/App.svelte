<script>
    let waiting = false;
    let valid = false;
    let done = false;
    let timeout = false;
    let address = '';
    let message_id = '';
    let success = false;
    let data = null;
    const explorer = 'https://explorer.iota.org/testnet/';
	
    function validate(event) {
        done = false;
        if (address.length == 64 && address.indexOf('atoi1') === 0) {
            valid = true;
        } else {
            valid = false;
        }
    }

    async function fetchWithTimeout(url, timeout = 25000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return res;
    }

    async function requestTokens(_event) {
        if (waiting) {
            return false;
        }
        waiting = true;
        let res = null;

        try {
            res = await fetchWithTimeout(`/api?address=${address}`);   
            data = await res.json();         
        } catch (error) {
            if (error.name === 'AbortError') {
                timeout = true;
            }
        }
        
        success = res && res.status === 200;
        done = true;
        waiting = false;
        message_id = data && data.data ? data.data.id : '';
        address = '';
    }

</script>

<main>
    <p class="welcome">Welcome to</p>
	<h1>IOTA Faucet</h1>
    <p class="help">This service distributes tokens to the requested IOTA address.</p>
    {#if done}
        <div class="warning">
            {#if success}
                {data.message}<br /><a href="{explorer}message/{message_id}">{message_id}</a>
            {:else if timeout}
                The faucet may be out of service. Please try again later or use the  <a href="https://faucet.tanglekit.de/">TangleKit faucet</a> in the meantime.
            {:else}
                {data.message}
            {/if}
        </div>
    {:else}
        <div class="warning">
            {#if waiting}
                Please wait...
            {:else}
                {#if valid}
                    Click the request button to receive your coins
                {:else}
                    Please enter a valid IOTA address (atoi1...)
                {/if}
            {/if}
        </div>
    {/if}
    <div class="iota-input">
        <label for="address">IOTA Address</label>
        <input type="text" bind:value={address} on:keyup={validate} disabled={waiting} />
    </div>
    <div class="right">
        <button type="button" on:click={requestTokens} class:disabled={waiting || !valid}>Request</button>
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
        background: #108CFF;
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
        color: #9AADCE;
        line-height: 160%;
        font-weight: 400;
        margin-top: 1em;
        margin-bottom: 2em;
    }

    .warning {
        font-size: 12px;
		color: #25395F;
        background: #f6f9ff;
        border-radius: 8px;
        padding: 10px 20px;
        margin-top: 1em;
        word-break: break-word;
    }
    

    .welcome {
        color: #108CFF;
        text-transform: uppercase;
        font-size: 14px;
        margin: 0;
    }

	h1 {
		color: #25395F;
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
        color: #9AADCE;
        position: absolute;
        top: 7px;
        left: 20px;
    }
    .iota-input input {
        width: 100%;
        border: none;
        padding: 20px 20px 10px;
        border: solid 1px #D8E3F5;
        border-radius: 10px;
        margin: 0;
        outline: none;
        background: #fff;
        font-size: 12px;
    }

</style>
