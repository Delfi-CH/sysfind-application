<script>
// @ts-nocheck

  import {getAllOs, getAllOsFromFiles } from "$lib/fetch.js"
  import { onMount } from 'svelte';
  import TheButtonThatLaunchesHalfLife from "$lib/components/TheButtonThatLaunchesHalfLife.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import OsListItem from "$lib/components/OsListItem.svelte";
  import FuzzySearch from "$lib/components/FuzzySearch.svelte";

  let data = $state([{}])
  let useLocalDataSource = $state(false)
  let displayData = $state([{}])
  let osNames = $state([])
  let halfLifeButton = $state({
    visible: false,
    appId: 0,
    text: "Full Life"
  })

  let showUnsupported = $state(false)

  onMount(async ()=> {
    await triggerRefetch()
  })

  async function triggerRefetch() {
    let result = [];
    if (useLocalDataSource) {
      result = await getAllOsFromFiles()
    } else {
      result = await getAllOs()
    }
    data = result
    displayData = data
    osNames = result.map((data)=>({id: data.id, name: data.name +" "+ data.version}))
  }

  async function handleSourceChange() {
    if (confirm("Warning! This will cancel all ongoing operations. Are you sure?") === true) {
      await triggerRefetch()
    } else {
      useLocalDataSource = !useLocalDataSource
    }
  }

  function handleSearch(searchResult) {
    if (searchResult === "Launch Half Life") {
      displayData = []
      halfLifeButton = {visible: true, appId: "70", text: searchResult}
      return
    } else if (searchResult === "Launch Half Life 2") {
      halfLifeButton = {visible: true, appId: "220", text: searchResult}
      return
    } else if (searchResult === "Launch Black Mesa") {
      halfLifeButton = {visible: true, appId: "362890", text: searchResult}
      return
    }
    if (searchResult.length < 1) {
      displayData = []
      return;
    }
    let result = []
    
    searchResult.forEach(element => {
      result = [...result, $state.snapshot(data).find((os)=> os.id === element.id)]
    });
    displayData = result
  }

  function resetSearch() {
    displayData = data
    halfLifeButton = {visible: false, appId: 0,text: "Full Life"}
  }

  function isVisibleId(id) {
    const found = $state.snapshot(displayData).find((os) => os.id == id)

    const visible = !!found
    const supported = found?.isSupported || $state.snapshot(showUnsupported)

    return visible && supported
}

</script>

<main class="container">
  <Navbar></Navbar>
  <FuzzySearch osNames={osNames} onSearch={handleSearch} onReset={(()=> resetSearch())}></FuzzySearch>
  <p>Show outdated / unsupported: <input type="checkbox" bind:checked={showUnsupported}></p>
  <p>Use local files: <input type="checkbox" bind:checked={useLocalDataSource} onchange={async ()=> handleSourceChange()}></p>
  <div>
    {#each data as os (os.id)}
      <OsListItem os={os} className={!isVisibleId(os.id) ? "invisible" : ""} useLocal={useLocalDataSource} />
    {:else}
      <p>Nothing was found...</p>
    {/each}
    {#if halfLifeButton.visible}
      <TheButtonThatLaunchesHalfLife steamAppId={halfLifeButton.appId} text={`${halfLifeButton.text} on Steam`} style=true></TheButtonThatLaunchesHalfLife>
    {/if}
  </div>
  <!---<TheButtonThatLaunchesHalfLife steamAppId=220 text="full life" style=true></TheButtonThatLaunchesHalfLife>-->
</main> 

<style>

</style>
