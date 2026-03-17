// @ts-nocheck
import axios from 'axios';
import { fetch } from '@tauri-apps/plugin-http';
import { invoke } from '@tauri-apps/api/core';
import { iniStringToObject } from '@delfi-ch/ini.js';
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

export async function getSha256SumFromUrl(hashUrl, fileUrl) {
    if (!hashUrl.startsWith("https://")){
        console.log("Identical Hash")
        return hashUrl;
    } 
    const splitFileUrl = fileUrl.split("/")
    const filename = splitFileUrl.pop()
    const res = await fetch(hashUrl, {method: "GET"})
    const body = await res.text()
    const splitBody =  body.trim().split('\n').map(line => {
        const [hash, filename] = line.split(/\s{2,}/)
        return { hash, filename }
    })

    const match = splitBody.find(v => v.filename === filename)

    if (match) {
        return match.hash
    }
    
    return hashUrl
}

export async function getAllOsFromFiles() {
    try {
        const directoryPath = "../data";
        const filesContents = await invoke('read_files', { dir: directoryPath });
        let res = []
        filesContents.forEach((file) => {
            try {
                let obj = iniStringToObject(file)
                obj.architectures = obj.architectures.split(", ")
                res = [...res, obj]
            } catch (err) {
                throw err
            }
        })
        return res
    } catch (err) {
        console.error(err);
    }
}