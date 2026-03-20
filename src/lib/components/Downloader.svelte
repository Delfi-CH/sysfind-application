<script>
// @ts-nocheck

    import { onMount, onDestroy } from "svelte";
    import {DownloadManager} from "$lib/download"
    import { buildOsFilename, checkForLocalOsImage, getSha256SumFromUrl } from "$lib/fetch";

    import * as path from '@tauri-apps/api/path';
    import { exists, mkdir, writeTextFile } from '@tauri-apps/plugin-fs';
    import { openPath } from "@tauri-apps/plugin-opener";
    import { platform } from '@tauri-apps/plugin-os';
    import { confirm } from '@tauri-apps/plugin-dialog';
    import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

    import { objectToIniString } from "@delfi-ch/ini.js";

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
    let oldDownloadProgressObject = $state({
        id: "-1",
        downloaded: 0,
        total: 1
    })

    let downloadProgressStatus = $state("Not downloading")

    let downloadPercentage = $derived(downloadProgressObject.downloaded / downloadProgressObject.total * 100);

    let downloadSpeed = $derived(((downloadProgressObject.downloaded - oldDownloadProgressObject.downloaded) * 8) / 1000000)

    let eta = $derived((downloadProgressObject.total / 1000000) / ((downloadProgressObject.downloaded - oldDownloadProgressObject.downloaded) / 1000000))

    let showProgressbar = $state(true)

    let downloadPath = $state("")
    let metaPath = $state("")

    let hostOs = $state(platform())
    
    onMount(async ()=>{
        let osSnapshot = $state.snapshot(os)
        let tempFilename = buildOsFilename(osSnapshot)
        filename = tempFilename
        url = osSnapshot.imageDownloadURL
        const dataDir = await path.appDataDir()
        const directoryPath = dataDir + "/local_iso/images";
        const metaDirPath = dataDir + "/local_iso/meta"
        await mkdir(directoryPath, { recursive: true })
        downloadPath = await path.join(directoryPath, filename)
        await mkdir(metaDirPath, { recursive: true })
        metaPath = await path.join(metaDirPath, (osSnapshot.name + osSnapshot.version + ".ini"))
        
        if (os.exists) {
            downloadProgressObject = {
                id: "-1",
                downloaded: 1,
                total: 1
            }
            downloadProgressStatus = "Exists on Disk"
            showProgressbar = false
        } 
    })

    onDestroy(()=>{
      cancelDownload()  
    })

    const downloader = new DownloadManager()

    async function startDownload() {
        const usableHash = await getSha256SumFromUrl(os.hash, url);
        if (downloadId !== "-1") {
            isActive = true
            return
        }
        const fileExistsCurrently = await checkForLocalOsImage(filename)
        if (os.exists && fileExistsCurrently) {
            const confirmation = await confirm("This file is already downloaded. Are you sure that you want to redownload it?", { title: 'Tauri', kind: 'warning' })
            if (!confirmation) {
                isActive = true
                return
            }
        }
        isActive = false
        showProgressbar = true
        downloadProgressStatus = "Download in progress..."
        downloadId = downloader.start(url, downloadPath, usableHash, {
                onProgress: (data) => {
                    oldDownloadProgressObject = $state.snapshot(downloadProgressObject)
                    downloadProgressObject = data
                },
                onFinished: async () => {
                    downloadProgressStatus = "Download finished"
                    downloadProgressObject = {id: "-1", downloaded: 0, total: 1}
                    downloadId = "-1"
                    isActive = true
                    const obj = {...os , architectures: os.architectures.map(arch => arch.name).join(", "), exists: true}
                    await writeTextFile(metaPath, objectToIniString(obj))
                    await sendDownloadNotification("Download finished!", `Finished downloading ${os.name + " " + os.version} to ${downloadPath}.`)
                },
                onCancelled: async () => {
                    downloadProgressStatus = "Download canceled"
                    downloadProgressObject = {id: "-1", downloaded: 0, total: 1}
                    oldDownloadProgressObject = {id: "-1", downloaded: 0, total: 1}
                    downloadId = "-1"
                    isActive = true
                    await sendDownloadNotification("Download canceled!", `Download of ${os.name + " " + os.version} to ${downloadPath} was canceled.`)
                },
                onHashMismatch: async (data) => {
                    downloadProgressStatus = "Failed to verify download! Expected " + data.expected + ", got " + data.actual
                    downloadProgressObject = {id: "-1", downloaded: 0, total: 1}
                    downloadId = "-1"
                    isActive = true
                    await sendDownloadNotification("Hash Mismatch!", `Failed to verify sha256 hash for ${os.name + " " + os.version}!`)
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
    }

    async function sendDownloadNotification(title, message) {
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
        }
        if (permissionGranted) {
            sendNotification({ title: title, body: message });
        }
    }
</script>

<main>
    {#if !useLocal}
        <div class="mainContainer">
        
            <div class="buttonContainer">
                <button onclick={startDownload} disabled={!isActive} class="buttonItem" style="border-top-left-radius: 1rem; border-bottom-left-radius: 1rem;">Download {os.name} {os.version}</button>
                <button onclick={cancelDownload} disabled={isActive} class="buttonItem" style="border-top-right-radius: 1rem; border-bottom-right-radius: 1rem;">Cancel Download</button>
            </div>
            {#if showProgressbar}
            <div class="barContainerContainer">
                <div class="barContainer">
                    <span class="bar" style="width: {downloadPercentage.toFixed(2)}%"></span>
                </div>
                {#if downloadProgressObject.id !== "-1"}
                    <span class="barProgress">Speed: {downloadSpeed.toFixed(2)} Mbp/s</span>
                    <span class="barProgress">{eta !== Infinity ? (eta / 60).toFixed(0) : 0} Minutes left</span>
                    <span class="barProgress">Progress: {downloadPercentage.toFixed(2)}%</span>
                    <span class="barProgress">{(downloadProgressObject.downloaded / 1000000).toFixed(2)} MB / {(downloadProgressObject.total / 1000000).toFixed(2)} MB</span>
                {/if}
            </div>
            {/if}
        </div>
        <p class="barProgress">Status: {downloadProgressStatus}</p>
        <button class="openExplorerButton" onclick={async ()=> await revealFile()}>Show in  {hostOs === "windows" ? "Explorer": "File Browser"}</button>
    {:else}
        {#if os.exists === false}
            <p class="imageNotFoundLocally">Image "{filename}" not found locally!</p>
        {/if}
        <button class="openExplorerButton" onclick={async ()=> await revealFile()}>Show in {hostOs === "windows" ? "Explorer": "File Browser"}</button>
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
        flex-direction: column;
        margin-top: 0.5rem;
    }
    .barContainer {
        display: flex;
        height: 2rem;
        border: 5px solid blue;
        background-color: #eee;
        border-radius: 2rem;
    }
    .bar {
        background-color: blue;
        border-radius: 2rem;
    }

    .barProgress {
        padding-left: 1rem;
        padding-top: 0;
        padding-bottom: 0;
        margin: 0;
    }

    .imageNotFoundLocally {
        color: red;
        font-weight: bolder;
    }
    
    .openExplorerButton {
        margin-left: 0rem;
        display: inline;
        border: none;
        background-color: #FEC823;
        padding: 0.7rem;
        padding-top: 0.4rem;
        padding-bottom: 0.4rem;
        border: 5px solid #FCA401;
        border-radius: 2rem;
        font-size: 100%;
        font-style: normal;
    }

    .openExplorerButton:hover {
        background-color: #fec723c0;
        border: 5px solid #FCA401c0;
        border-radius: 2rem;
        cursor: pointer;
    }
</style>