<script>
// @ts-nocheck

    import { onMount, onDestroy } from "svelte";
    import {DownloadManager} from "$lib/download"
    import * as path from '@tauri-apps/api/path';
    import { mkdir } from '@tauri-apps/plugin-fs';
    import { openPath } from "@tauri-apps/plugin-opener";
    import { platform } from '@tauri-apps/plugin-os';
    import { getSha256SumFromUrl } from "$lib/fetch";
    let {os, useLocal} = $props()

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

    let hostOs = $state(platform())
    
    onMount(async ()=>{
        let osSnapshot = $state.snapshot(os)
        let tempFilename = osSnapshot.name.replace(/\s/g, "") + "_" + 
            osSnapshot.version.replace(/\s/g, "") + "_"+ 
            determinePossibleArchitecture(osSnapshot.architectures).replace(/\s/g, "") + ".iso"
        filename = tempFilename
        url = osSnapshot.imageDownloadURL
        const dataDir = await path.appDataDir()
        const directoryPath = dataDir + "/local_iso/images";
        await mkdir(directoryPath, { recursive: true })
        downloadPath = await path.join(directoryPath, filename)
    })

    onDestroy(()=>{
      cancelDownload()  
    })

    function determinePossibleArchitecture(architecturesArray) {
        const ids = architecturesArray.map(a => a.id);

        const has = (fn) => ids.some(fn);

        if (has(id => id >= 5 && id <= 8)) return "x86-64";
        if (has(id => id >= 1 && id <= 8)) return "i386";
        if (has(id => id >= 1 && id <= 9)) return "8086";
        if (has(id => [12,16,17].includes(id))) return "arm64";
        if (has(id => id >= 11 && id <= 17)) return "arm32";
        if (has(id => id === 10)) return "IA-64";
        if (has(id => id === 31)) return "IBM-Z-s390x";
        if (has(id => id === 24)) return "PowerISA";
        if (has(id => id === 23)) return "ppc64";
        if (has(id => id >= 22 && id <= 23)) return "ppc32";
        if (has(id => id === 21)) return "m68k";
        if (has(id => id >= 25 && id <= 26)) return "SPARC";
        if (has(id => id >= 27 && id <= 28)) return "DEC";

        return "Unknown";
    }

    const downloader = new DownloadManager()

    async function startDownload() {
        const usableHash = await getSha256SumFromUrl(os.hash, url);
        if (downloadId !== "-1") {
            isActive = true
            return
        }
        isActive = false
        downloadProgressStatus = "Download in progress..."
        downloadId = downloader.start(url, downloadPath, usableHash, {
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

    async function revealFile() {
        const isoDir = await path.dirname(downloadPath)
        await openPath(isoDir)
        console.log(isoDir)
        
    }
</script>

<main>
    {#if !useLocal}
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
        <p>Status: {downloadProgressStatus}</p>
        <button onclick={async ()=> await revealFile()}>Show in  {hostOs === "windows" ? "Explorer": "File Browser"}</button>
    {:else}
        <button onclick={async ()=> await revealFile()}>Show in  {hostOs === "windows" ? "Explorer": "File Browser"}</button>
    {/if}
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