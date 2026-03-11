<script>
// @ts-nocheck

    import { downloadFile } from "$lib/fetch";
    import { onMount } from "svelte";

    let {os} = $props()

    let filename = $state("image.iso")

    onMount(()=>{
        console.log("mount")
        let osSnapshot = $state.snapshot(os)
        let tempFilename = osSnapshot.name.replace(/\s/g, "") + "_" + 
            osSnapshot.version.replace(/\s/g, "") + "_"+ 
            osSnapshot.architectures[0].name.replace(/\s/g, "") + ".iso"
        filename = tempFilename
    })

    async function handleDownload(url, filename) {
        try {
            const path = await downloadFile(url, filename)
            alert(path)
        } catch (e) {
            alert(e)
        }
    }

</script>

<main>
    <button onclick={async ()=> handleDownload(os.imageDownloadURL, filename)} class="download">Download {os.name}</button>
</main>

<style>
    .download:disabled {
        color: green;
    }
</style>