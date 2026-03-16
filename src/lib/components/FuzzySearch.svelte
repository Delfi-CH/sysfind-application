<script>
// @ts-nocheck

    import Fuse from "fuse.js"
    import { onMount } from 'svelte';

    let {osNames, onSearch, onReset} = $props()

    let searchParam = $state("")

    const options = {includeScore: true, keys: ["name"]}

    function handleSearch() {
        if (searchParam === "Launch Half Life" || searchParam === "Launch Half Life 2" || searchParam === "Launch Black Mesa") {
            onSearch(searchParam)
        }
        const fuse = new Fuse(osNames, options)
        const result = fuse.search(searchParam)
        onSearch(result.map((value)=> ({id: value.item.id,name: value.item.name, score: value.score})))
    }
    function handleReset() {
        searchParam = ""
        onReset()
    }
</script>

<main>
    <div>
        <input type="text" bind:value={searchParam}>
        <button onclick={handleSearch}>Search</button>
        <button onclick={handleReset}>Reset</button>
    </div>
</main>