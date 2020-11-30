<script>
    let waiting = false;
    let valid = false;
    let done = false;
    let address = '';
    let success = false;
    let data = null;
    const explorer = 'https://tangle-explorer.dag.sh/chrysalis/';
    
    function validate(event) {
        done = false;
        if ((address.length == 63 && address[3] == '1') || address.length == 64 && address[4] == '1' ) {
            valid = true;
        } else {
            valid = false;
        }
    }

    async function requestTokens(event) {
        if(waiting) {
            return false;
        }
        waiting = true;

        const res = await fetch('/api?address=' + address);
        data = JSON.stringify(res);

        success = res.status == 200;
        done = true;
        waiting = false;
    }

</script>

<main>
    <p class="welcome">Welcome to</p>
	<h1>IOTA Faucet</h1>
    <p class="help">This service distributes tokens to the requested IOTA address.</p>
    {#if done}
        <div class="warning">
            {#if success}
                {data.message}<br /><a href="{explorer}{address}">{address}!</a>
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
                    Click the request button to recieve your coins
                {:else}
                    Please enter a valid IOTA address (iot1...)
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
