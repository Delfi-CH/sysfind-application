<script>
// @ts-nocheck

    import { downloadFile } from "$lib/fetch";

    let {url, filename, doDownload} = $props();

    let downloadPercentage = $state(0)
    let downloadSpeed = $state(0)
    let downloadedMBytes = $state(0)
    let totalDownloadedMbytes = $state(0)

    function handleDownload(url, filename) {
        downloadFile(url, filename, (progress)=>{
            downloadSpeed = (progress.transferSpeed / (1024 * 1024)).toFixed(2)
            downloadedMBytes = (progress.progressTotal / (1024 * 1024)).toFixed(2)
            totalDownloadedMbytes = (progress.total / (1024 * 1024)).toFixed(2)
            downloadPercentage = (progress.progressTotal / progress.total * 100).toFixed(2)
        })
    }

    $effect(()=>{
        console.log("dolod", doDownload)
        if (doDownload) {
            handleDownload(url, filename)
        }
    })
</script>

<main>
    <p class="barContainer"><span class="bar" style="width: {downloadPercentage}%"></span></p>
    <p>Downloaded {downloadedMBytes} MBs of {totalDownloadedMbytes} MBs ({downloadPercentage}%) {downloadSpeed} MB/s</p>
</main>

<style>
    .barContainer {
        display: flex;
        width: 30%;
        height: 1rem;
        border: 2px solid gray;
        background-color: #eee;
        border-radius: 4px;
        overflow: hidden;
    }

    .bar {
        height: 100%;
        background-color: blue;
        transition: width 0.2s ease;
    }
</style>