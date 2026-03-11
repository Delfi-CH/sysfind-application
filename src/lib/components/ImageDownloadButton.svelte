<script>
// @ts-nocheck

    import { onMount } from "svelte";
    import Downloader from "./Downloader.svelte";

    let {os} = $props()

    let filename = $state("image.iso")
    let doDownload = $state(false)
    
    onMount(()=>{
        console.log("mount")
        let osSnapshot = $state.snapshot(os)
        let tempFilename = osSnapshot.name.replace(/\s/g, "") + "_" + 
            osSnapshot.version.replace(/\s/g, "") + "_"+ 
            osSnapshot.architectures[0].name.replace(/\s/g, "") + ".iso"
        filename = tempFilename
    })

    function handleClick() {
        doDownload = true
    }

</script>

<main>
    <button class="download" onclick={handleClick}>Download {os.name}</button>
    <Downloader url={os.imageDownloadURL} filename={filename} doDownload={doDownload}></Downloader>
</main>

<style>
    .download:disabled {
        color: green;
    }
</style>