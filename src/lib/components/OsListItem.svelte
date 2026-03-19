<script>
    let {os, className, useLocal} = $props()
    import Downloader from "./Downloader.svelte";
    import OsViewer from "./OsViewer.svelte";
    let showDetails = $state(false)

    function handleDetailViewing() {
        showDetails = !showDetails
    }
</script>

<main>
    <div class={className}>
    <div class="container">
        <div class="osListItemTitle">
            <h1>{os.name} {os.version}</h1>
            <button class="detailButton" onclick={handleDetailViewing}>{showDetails ? "↑ Show less" : "↓ Show more"}</button>
        </div>
        {#if showDetails}
            <OsViewer os={os}></OsViewer> 
        {/if}
        {#if os.imageDownloadURL} 
            <Downloader os={os} useLocal={useLocal}></Downloader>
        {:else if !useLocal}
            <p class="noDownloadText">No download available</p>
        {/if}
    </div>
    </div>
</main>

<style>
    .invisible {
        display: none;
    }
    .container {
        border: 5px solid black;
        padding: 0.5rem;
        min-height: 20rem;
        background-color: #E4EEFF;
        border-radius: 1.5rem;
    }
    .detailButton {
        height: fit-content;
        padding: 0.5rem;  
        font-size: 100%;
        color: white;
        background-color: #0042FF;
        border: 5px solid blue;
        border-radius: 2rem;
    }

    .detailButton:hover {
        background-color: rgba(0, 132, 255);
        cursor: pointer;
    }
    .osListItemTitle {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        height: 5rem;
        align-items: center;
    }

    .noDownloadText {
	    border: 5px solid rgb(102, 101, 101);
        border-radius: 2rem;
	    padding: 0.4rem;
        color: white;
        background-color: gray;
        cursor: not-allowed;
        width: fit-content;
    }
</style>