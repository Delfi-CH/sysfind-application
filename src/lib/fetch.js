// @ts-nocheck
import axios from 'axios';
import { download } from "@tauri-apps/plugin-upload";
import * as path from '@tauri-apps/api/path';

export const backendURL = "http://localhost:3000"

export async function getAllOs() {
    const res = await axios.get(backendURL+"/operatingSystem")
    const data = Object.values(res.data)
    return data
}

export async function getSpecificOs(id) {
    const res = await axios.get(backendURL+"/operatingSystem/" + id)
    return res.data
}

export async function getOsByFamily(family) {
    const res = await axios.get(backendURL+"/operatingSystem/family/" + family)
    const data = Object.values(res.data)
    return data
}

export async function getOsByArchitecture(architecture) {
    const res = await axios.get(backendURL+"/operatingSystem/architecture/" + architecture)
    const data = Object.values(res.data)
    return data
}

export async function downloadFile(url, filename) {
    const downloadDir = await path.downloadDir()

    await download(url, downloadDir + filename, (progress) => {
        console.log(progress)
    })
}