<script>
// @ts-nocheck
    import { onMount } from "svelte";
    import Downloader from "./Downloader.svelte";
    import { slide } from "svelte/transition";

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
    <ul class="osVierwerList" transition:slide>
        <li class="osVierwerListItem osVierwerBackgroundBlue">Version: {os.version}</li>
        <li class="osVierwerListItem osVierwerBackgroundWhite">Family: {os.family}</li>
        <li class="osVierwerListItem osVierwerBackgroundBlue">Website: <a href={os.homepage} target="_blank">{os.homepage}</a></li>
        <li class="osVierwerListItem osVierwerBackgroundWhite">Supported: {os.isSupported ? "Yes" : "No"}</li>
        <li class="osVierwerListItem osVierwerBackgroundBlue">Architectures: {mapArchitectures(os.architectures)}</li>
    </ul>
    <p>{os.description}</p>
</main>

<style>
    .osVierwerList {
        padding: 0;
        margin: 0;
        border: 3px solid black;
        width: fit-content;
    }
    .osVierwerListItem {
        list-style: none;
        padding: 0.3rem;
    }
    .osVierwerBackgroundBlue {
        background-color: #E4EEFF;
    }
    .osVierwerBackgroundWhite {
        background-color: #FFFFFF;
    }
</style>