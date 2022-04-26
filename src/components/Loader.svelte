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
        background-image: linear-gradient(0deg, #ff00cc 0%, #333399 100%);
        animation: spin 2s infinite linear;
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
