<script>
// @ts-nocheck

    import Fuse from "fuse.js"
    import { operatingSystemFamilies, processorArchitecture } from '$lib/model.js';

    let {osNames, onSearch, onReset} = $props()

    let searchParam = $state("")
    
    let selectedFamily = $state("")
    let selectedArch = $state("")

    const options = {includeScore: true, keys: ["name"]}

    function handleSearch() {
        if (searchParam === "Launch Half Life" || searchParam === "Launch Half Life 2" || searchParam === "Launch Black Mesa") {
            onSearch(searchParam, "Half Life", "Half Life")
        }
        const fuse = new Fuse(osNames, options)
        const result = fuse.search(searchParam)
        onSearch(result.map((value)=> ({id: value.item.id,name: value.item.name, score: value.score})), selectedFamily, selectedArch)
    }

    function handleReset() {
        searchParam = ""
        selectedFamily = ""
        selectedArch = ""
        onReset()
    }
</script>

<main>
    <div>
        <input type="text" id="searchParam" bind:value={searchParam} placeholder="Type Operating System name"> 
        <button onclick={handleSearch}>Search</button>
        <button onclick={handleReset}>Reset</button>
        <label for="family">Operating System Family</label>
        <select name="family" id="family" bind:value={selectedFamily}>
            <option value="">ALl</option>
            {#each Object.entries(operatingSystemFamilies) as family}
                <option value={family[1]}>{family[1]}</option>
            {/each}
        </select>
        <label for="arch">Processor Architecture</label>
        <select name="arch" id="arch" bind:value={selectedArch}>
            <option value="">All</option>
            {#each Object.entries(processorArchitecture) as arch}
                <option value={arch[1]}>{arch[1]}</option>
            {/each}
        </select>
    </div>
</main>

<style>
</style>