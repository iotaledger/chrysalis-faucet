<script>
  import { fade } from "svelte/transition";
  export let errorMessage;
</script>

<main in:fade>
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
