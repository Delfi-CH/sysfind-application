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
    <p>{os.description}</p>
</main>

<style>

</style>