<script>
// @ts-nocheck
    import { onMount } from "svelte";
    import Downloader from "./Downloader.svelte";

    let {os} = $props()

    function mapArchitectures(arch) {
        if (typeof(arch[0]) === "string") {
            return arch.join(", ")
        } else {
            return arch.map(arch => arch.name ).join(", ")
        }
    }
</script>

<main>
    <ul>
        <li>Version: {os.version}</li>
        <li>Family: {os.family}</li>
        <li>Webpage: <a href={os.homepage} target="_blank">{os.homepage}</a></li>
        <li>Supported: {os.isSupported ? "Yes" : "No"}</li>
        <li>Architectures: {mapArchitectures(os.architectures)}</li>
    </ul>
    <p>{os.description}</p>
</main>

<style>

</style>