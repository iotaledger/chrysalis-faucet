<div>
  <p>Fetching network from node...</p>
  <div class="spinner" />
</div>

<style>
  div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .spinner {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-left: 10px;
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
