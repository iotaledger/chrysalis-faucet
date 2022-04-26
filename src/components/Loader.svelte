<main>
  <h1>Fetching network from node...</h1>
  <div class="spinner" />
</main>

<style>
  main {
    margin-left: 10%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .spinner {
    position: relative;
    width: 70px;
    height: 70px;
    border-radius: 50%;
  }
  .spinner::before,
  .spinner:after {
    content: "";
    position: absolute;
    border-radius: inherit;
  }
  .spinner:before {
    width: 100%;
    height: 100%;
    background-color: #5a5a5a;
    animation: pulse 1s infinite linear;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.75);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
      opacity: 0;
    }

    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
      opacity: 1;
    }

    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
      opacity: 0;
    }
  }
</style>
