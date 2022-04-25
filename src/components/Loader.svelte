<script>
</script>

<main>
    <h1>Waiting</h1>
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
        width: 80px;
        height: 80px;
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
        background-image: linear-gradient(0deg, #ff00cc 0%, #333399 100%);
        animation: spin 0.5s infinite linear;
    }
    .spinner:after {
        width: 85%;
        height: 85%;
        background-color: white;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
