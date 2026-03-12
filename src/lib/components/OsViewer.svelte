<script>
// @ts-nocheck
    import { onMount } from "svelte";
    import Downloader from "./Downloader.svelte";

    let {os} = $props()
</script>

<main>
    <h1>{os.name}</h1>
    <ul>
        <li>Version: {os.version}</li>
        <li>Family: {os.family}</li>
        <li>Webpage: <a href={os.homepage} target="_blank">{os.homepage}</a></li>
        <li>Supported: {os.isSupported ? "Yes" : "No"}</li>
        <li>Architectures: {os.architectures?.map(arch => arch.name ).join(", ")}</li>
    </ul>
    {#if os.imageDownloadURL} 
        <Downloader os={os}></Downloader>
    {:else}
        <p class="noDownload">No download available</p>
    {/if}
    <p>{os.description}</p>
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
</style>