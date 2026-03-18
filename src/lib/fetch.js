// @ts-nocheck
import axios from 'axios';
import { fetch } from '@tauri-apps/plugin-http';
import { invoke } from '@tauri-apps/api/core';
import { iniStringToObject } from '@delfi-ch/ini.js';
import * as path from '@tauri-apps/api/path';
import { mkdir, exists } from '@tauri-apps/plugin-fs';

export const backendURL = "http://localhost:3000"

export async function getAllOs() {
    const res = await axios.get(backendURL+"/operatingSystem")
    let data = Object.values(res.data)
    let newData = []
    for (let os of data) {
        const imageExists = await checkForLocalOsImage(buildOsFilename(os))
        os = {...os, exists: imageExists}
        newData = [...newData, os]
    }
    return newData
}

export async function getSpecificOs(id) {
    const res = await axios.get(backendURL+"/operatingSystem/" + id)
    let data = res.data
    const imageExists = await checkForLocalOsImage(buildOsFilename(data))
    data = {...data, exists: imageExists}
    return data
}

export async function getOsByFamily(family) {
    const res = await axios.get(backendURL+"/operatingSystem/family/" + family)
    let data = Object.values(res.data)
    let newData = []
    for (let os of data) {
        const imageExists = await checkForLocalOsImage(buildOsFilename(os))
        os = {...os, exists: imageExists}
        newData = [...newData, os]
    }
    return newData  
}

export async function getOsByArchitecture(architecture) {
    const res = await axios.get(backendURL+"/operatingSystem/architecture/" + architecture)
    let data = Object.values(res.data)
    let newData = []
    for (let os of data) {
        const imageExists = await checkForLocalOsImage(buildOsFilename(os))
        os = {...os, exists: imageExists}
        newData = [...newData, os]
    }
    return newData
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
        const dataDir = await path.appDataDir()
        const directoryPath = dataDir + "/local_iso/meta";
        await mkdir(directoryPath, { recursive: true })
        const filesContents = await invoke('read_files', { dir: directoryPath });
        let res = []
        for (const file of filesContents) {
            try {
                let obj = iniStringToObject(file)
                obj.architectures = obj.architectures.split(", ")
                const imageExists = await checkForLocalOsImage(buildOsFilename(obj))
                obj = {...obj, exists: imageExists}
                res = [...res, obj]
            } catch (err) {
                throw err
            }
        }
        return res
    } catch (err) {
        console.error(err);
    }
}

export async function checkForLocalOsImage(filename) {
    const dataDir = await path.appDataDir()
    const directoryPath = dataDir + "/local_iso/images";
    await mkdir(directoryPath, { recursive: true })
    const imageDir = await path.join(directoryPath, filename)
    const imageExists = await exists(imageDir)
    return imageExists
}

export function buildOsFilename(os) {
    if (typeof(os.architectures[0]) === "string") {
        return os.name.replace(/\s/g, "") + "_" + 
            os.version.replace(/\s/g, "") + "_"+ 
            determinePossibleArchitectureFromName(os.architectures).replace(/\s/g, "") + ".iso"
    } else {
        return os.name.replace(/\s/g, "") + "_" + 
            os.version.replace(/\s/g, "") + "_"+ 
            determinePossibleArchitectureFromId(os.architectures).replace(/\s/g, "") + ".iso"
    }
    
}

function determinePossibleArchitectureFromId(architecturesArray) {
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
    if (has(id => id >= 19 && id <= 20)) return "RiscV"

    return "Unknown";
}

function determinePossibleArchitectureFromName(architecturesArray) {
    const x86_64 = architecturesArray.find((name) => name.startsWith("x86-64"))
    const i386 = architecturesArray.find((name) => name === "i386" || name === "i486" || name === "i586" || name === "i686")
    const arm64 = architecturesArray.find((name) => name === "Aarch64")
    const arm32 = architecturesArray.find((name) => name === "Aarch32")
    const arm = architecturesArray.find((name) => name.startsWith("ARMv"))
    const ia64 = architecturesArray.find((name) => name === "IA64")
    const ibms = architecturesArray.find((name) => name.startsWith("IBM s/"))
    const ibmz = architecturesArray.find((name) => name === "IBM z/Architeture")
    const ppc = architecturesArray.find((name) => name.startsWith("ppc"))
    const power = architecturesArray.find((name) => name === "PowerISA")
    const m68k = architecturesArray.find((name) => name === "m68k")
    const riscv = architecturesArray.find((name) => name.startsWith("RiscV"))
    const sparc = architecturesArray.find((name) => name.startsWith("Sparc"))
    const dec = architecturesArray.find((name) => name.startsWith("DEC "))
    if (x86_64) {
        return x86_64
    } else if (i386) {
        return i386
    } else if (arm64) {
        return arm64
    } else if (arm32) {
        return arm32
    } else if (arm) {
        return arm
    } else if (ia64) {
        return ia64
    } else if (riscv) {
        return riscv
    } else if (ppc) {
        return ppc
    } else if (ibmz) {
        return ibmz
    } else if (ibms) {
        return ibms
    } else if (power) {
        return power
    } else if (m68k) {
        return m68k
    } else if (sparc) {
        return sparc
    } else if (dec) {
        return dec
    } else {
        return "Unknown"
    }
}

export async function checkForInternet() {
    try {
        const res = await fetch(backendURL + "/", {
            method: "GET"
        })
        return res.status === 200
    } catch {
        return false
    }
}