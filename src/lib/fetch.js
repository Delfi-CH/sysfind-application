// @ts-nocheck
import axios from 'axios';

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

import { invoke } from "@tauri-apps/api/core";

export async function downloadFile(url, filename) {
    const res = await invoke("handle_download", { downloadUrl: url, filename: filename})
    if (!res[0]) {
        throw new Error("Download failed")
    }
    return res[1]
}