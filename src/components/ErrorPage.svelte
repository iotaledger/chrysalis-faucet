<script>
    export let errorMessage;
</script>

<main>
    <h1>
        There was an error:
        <p>
            {errorMessage}
        </p>
    </h1>

    <button onClick="window.location.reload();">Try again</button>
</main>

<style>
    main {
        margin-left: 10%;
    }
</style>
