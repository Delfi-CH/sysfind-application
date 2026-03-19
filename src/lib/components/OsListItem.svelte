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
        <h1>{os.name} {os.version} <button class="detailButton" onclick={handleDetailViewing}>Show more</button></h1>
        {#if showDetails}
            <OsViewer os={os}></OsViewer> 
        {/if}
        {#if os.imageDownloadURL} 
            <Downloader os={os} useLocal={useLocal}></Downloader>
        {:else if !useLocal}
            <p>No download available</p>
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
    }
    .detailButton {
        height: 2rem;
    }
</style>