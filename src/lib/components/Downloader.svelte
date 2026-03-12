<script>
// @ts-nocheck

    import { onMount } from "svelte";
    import {DownloadManager} from "$lib/download"
    import * as path from '@tauri-apps/api/path';
    let {os} = $props()

    let filename = $state("image.iso")
    let url = $state("https://delfi.dev/")
    let downloadId = $state("-1")
    let isActive = $state(true)

    let downloadProgressObject = $state({
        id: "-1",
        downloaded: 0,
        total: 1
    })

    let downloadPercentage = $derived(downloadProgressObject.downloaded / downloadProgressObject.total * 100);
    
    onMount(()=>{
        let osSnapshot = $state.snapshot(os)
        let tempFilename = osSnapshot.name.replace(/\s/g, "") + "_" + 
            osSnapshot.version.replace(/\s/g, "") + "_"+ 
            osSnapshot.architectures[0].name.replace(/\s/g, "") + ".iso"
        filename = tempFilename
        url = osSnapshot.imageDownloadURL
    })

    const downloader = new DownloadManager()

    async function startDownload() {
        if (downloadId !== "-1") {
            isActive = true
            return
        }
        const downloadDir = await path.downloadDir()
        isActive = false
        downloadId = downloader.start(url, downloadDir + filename, {
                onProgress: (data) => {
                    downloadProgressObject = data
                },
                onFinished: () => {
                    console.log("Done!");
                    isActive = true
                },
                onCancelled: () => {
                    console.log("Cancelled");
                    isActive = true
                },
            }
        )
        
    }

    function cancelDownload() {
        if (downloadId === "-1") {
            return false
        }  else {
            downloader.cancel(downloadId)
            isActive = true
            return true
        }
    }
</script>

<main>
    <button onclick={startDownload} disabled={!isActive}>Download {filename}</button>
    <button onclick={cancelDownload} disabled={isActive}>Cancel Download</button>
    <div class="barContainer"><span class="bar" style="width: {downloadPercentage}%"></span></div> <span>{downloadPercentage.toFixed(2)}%</span>
</main>

<style>
    .barContainer {
        display: flex;
        width: 30%;
        height: 1rem;
        border: 3px solid blue;
        background-color: #eee;
    }
    .bar {
        background-color: blue;
    }
</style>