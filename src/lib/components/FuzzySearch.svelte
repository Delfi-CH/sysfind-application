<script>
// @ts-nocheck

    import Fuse from "fuse.js"
    import { operatingSystemFamilies, processorArchitecture } from '$lib/model.js';

    let {osNames, onSearch, onReset} = $props()

    let searchParam = $state("")
    
    let selectedFamily = $state("all")
    let selectedArch = $state("all")

    const options = {includeScore: true, keys: ["name"]}

    function handleSearch() {
        if (searchParam.length <= 0 && selectedArch === "all" && selectedFamily === "all") {
            return
        }

        if (searchParam === "Launch Half Life" || searchParam === "Launch Half Life 2" || searchParam === "Launch Black Mesa") {
            onSearch(searchParam, "Half Life", "Half Life")
        }
        const fuse = new Fuse(osNames, options)
        const result = fuse.search(searchParam)
        onSearch(result.map((value)=> ({id: value.item.id,name: value.item.name, score: value.score})), selectedFamily, selectedArch)
    }

    function handleReset() {
        searchParam = ""
        selectedFamily = "all"
        selectedArch = "all"
        onReset()
    }
</script>

<main>
    <div class="fuzzySearchContainer">
        
        <input type="text" id="searchParam" class="fuzzyTextInput" bind:value={searchParam} placeholder="Type Operating System name"> 
        <div class="fuzzyButtonContainer">
            <button onclick={handleSearch} class="fuzzyButtonItem" style="border-top-left-radius: 2rem; border-bottom-left-radius: 2rem; border-right: 3px solid blue;"><img src="lens.svg" width="32px" alt="lens" style="align-items: center;">Search</button>
            <button onclick={handleReset} class="fuzzyButtonItem" style="border-top-right-radius: 2rem; border-bottom-right-radius: 2rem; border-left: 3px solid blue;">Reset</button>
        </div>
        <label for="family">Operating System Family</label>
        <select name="family" id="family" bind:value={selectedFamily} class="fuzzySelector">
            <option value="all" selected="selected">All</option>
            {#each Object.entries(operatingSystemFamilies) as family}
                <option value={family[1]}>{family[1]}</option>
            {/each}
        </select>
        <label for="arch">Processor Architecture</label>
        <select name="arch" id="arch" bind:value={selectedArch} class="fuzzySelector">
            <option value="all" selected="selected">All</option>
            {#each Object.entries(processorArchitecture) as arch}
                <option value={arch[1]}>{arch[1]}</option>
            {/each}
        </select>
    </div>
</main>

<style>
    .fuzzySearchContainer {
        display: flex;
        flex-direction: column;
    }
    .fuzzyButtonContainer {
        display: flex;
        flex-direction: row; 
        border: 5px solid blue;
        border-radius: 2rem;
        background-color: blue;
        margin: 0.5rem;
    }
    .fuzzyButtonItem {
        display: flex;
        width: 50%;
        align-items: center;
        gap: 0.5rem;
        font-size: 130%;
        justify-content: center;
        border: none;
        background-color: #0042FF;
        color: white;
        transition: 0.2s;
    }

    .fuzzyButtonItem:hover {
        cursor: pointer;
        background-color: rgba(0, 132, 255);
    }

    .fuzzySelector:hover {
        cursor: pointer;
    }

    .fuzzyTextInput {
        padding: 0.3rem;
        font-size: 110%;
    }
</style>