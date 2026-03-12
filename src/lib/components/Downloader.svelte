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

    let downloadProgressStatus = $state("Not downloading")

    let downloadPercentage = $derived(downloadProgressObject.downloaded / downloadProgressObject.total * 100);

    let downloadPath = $state("")
    
    onMount(async ()=>{
        let osSnapshot = $state.snapshot(os)
        let tempFilename = osSnapshot.name.replace(/\s/g, "") + "_" + 
            osSnapshot.version.replace(/\s/g, "") + "_"+ 
            osSnapshot.architectures[0].name.replace(/\s/g, "") + ".iso"
        filename = tempFilename
        url = osSnapshot.imageDownloadURL
        downloadPath = await path.join(await path.downloadDir(), filename)
    })

    const downloader = new DownloadManager()

    async function startDownload() {
        if (downloadId !== "-1") {
            isActive = true
            return
        }
        isActive = false
        downloadProgressStatus = "Download in progress..."
        downloadId = downloader.start(url, downloadPath, os.hash, {
                onProgress: (data) => {
                    downloadProgressObject = data
                },
                onFinished: () => {
                    downloadProgressStatus = "Download finished"
                    downloadProgressObject = {id: "-1", downloaded: 0, total: 1}
                    downloadId = "-1"
                    isActive = true
                },
                onCancelled: () => {
                    downloadProgressStatus = "Download canceled"
                    downloadProgressObject = {id: "-1", downloaded: 0, total: 1}
                    downloadId = "-1"
                    isActive = true
                },
                onHashMismatch: (data) => {
                    downloadProgressStatus = "Failed to verify download! Expected " + data.expected + ", got " + data.actual
                    downloadProgressObject = {id: "-1", downloaded: 0, total: 1}
                    downloadId = "-1"
                    isActive = true
                }
            }
        )
        
    }

    function cancelDownload() {
        if (downloadId === "-1") {
            return false
        }  else {
            downloader.cancel(downloadId)
            isActive = true
            setTimeout(()=> {
                downloadProgressStatus = "Download canceled"
            }, 100)
            return true
        }
    }
</script>

<main>
    <div class="mainContainer">
        <div class="buttonContainer">
            <button onclick={startDownload} disabled={!isActive} class="buttonItem" style="border-top-left-radius: 1rem; border-bottom-left-radius: 1rem;">Download {os.name} {os.version}</button>
            <button onclick={cancelDownload} disabled={isActive} class="buttonItem" style="border-top-right-radius: 1rem; border-bottom-right-radius: 1rem;">Cancel Download</button>
        </div>
        <div class="barContainerContainer">
            <div class="barContainer">
                <span class="bar" style="width: {downloadPercentage.toFixed(2)}%"></span>
            </div>
            <span class="barProgress">{downloadPercentage.toFixed(2)}%</span>
        </div>
    </div>
    <ul>
        <li>Status: {downloadProgressStatus}</li>
        
        <li>Output: {downloadPath}</li>
    </ul>
</main>

<style>

    .mainContainer {
        display: flex;
        flex-direction: column;
    }

    .buttonContainer {
        display: flex;
        flex-direction: row; 
        border: 5px solid blue;
        width: fit-content;
        border-radius: 2rem;
        background-color: blue;
        
    }

    .buttonItem {
        background: none;
	    color: inherit;
	    border: none;
	    padding: 0.4rem;
	    font: inherit;
	    cursor: pointer;
	    outline: inherit;
        background-color: rgb(0, 132, 255, 0.5);
        color: white;
        
    }

    .buttonItem:hover {
        background-color: rgba(0, 132, 255);
    }

    .buttonItem:disabled {
        background-color: gray;
        cursor: not-allowed;
    }
    .barContainerContainer {
        display: flex;
        flex-direction: row;
        margin-top: 0.5rem;
        text-align: center;
    }
    .barContainer {
        display: flex;
        width: 30%;
        height: 2rem;
        border: 5px solid blue;
        background-color: #eee;
        margin-right: 0.5rem;
        border-radius: 2rem;
    }
    .bar {
        background-color: blue;
        border-radius: 2rem;

    }

    .barProgress {
        text-align: center;
        font-size: 190%;
    }
</style>