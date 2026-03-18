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
    <h1>{os.name} {os.version} <button onclick={handleDetailViewing}>Show more</button></h1>
    {#if showDetails}
       <OsViewer os={os}></OsViewer> 
    {/if}
    {#if os.imageDownloadURL} 
        <Downloader os={os} useLocal={useLocal}></Downloader>
    {:else if !useLocal}
        <p class="noDownload">No download available</p>
    {/if}
    </div>
</main>

<style>
    .noDownload {
        background-color: #0042FF;
        padding: 0.4rem;
        color: white;
        width: fit-content;
        border: 5px solid blue;
        border-radius: 2rem;
        cursor: not-allowed;
    }
    .invisible {
        display: none;
    }
</style>