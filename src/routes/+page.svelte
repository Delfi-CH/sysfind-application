<script>
// @ts-nocheck

  import {getAllOs } from "$lib/fetch.js"
  import { onMount } from 'svelte';
  import TheButtonThatLaunchesHalfLife from "$lib/components/TheButtonThatLaunchesHalfLife.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import OsListItem from "$lib/components/OsListItem.svelte";
  import FuzzySearch from "$lib/components/FuzzySearch.svelte";

  let data = $state([{}])
  let displayData = $state([{}])
  let osNames = $state([])

  onMount(async ()=> {
    const result = await getAllOs()
    data = result
    displayData = data
    osNames = result.map((data)=>({id: data.id, name: data.name +" "+ data.version}))
  })

  function handleSearch(searchResult) {
    if (searchResult.length < 1) {
      displayData = []
      return;
    }
    let result = []
    
    searchResult.forEach(element => {
      result = [...result, $state.snapshot(data).find((os)=> os.id === element  .id)]
    });
    displayData = result
  }

  function resetSearch() {
    displayData = data
  }

  function isVisibleId(id) {
    return $state.snapshot(displayData.find((os) => os.id == id)) ? true : false
  }

</script>

<main class="container">
  <Navbar></Navbar>
  <FuzzySearch osNames={osNames} onSearch={handleSearch} onReset={(()=> displayData = data)}></FuzzySearch>
  <div>
    {#each data as os (os.id)}
      <OsListItem os={os} className={!isVisibleId(os.id) ? "invisible" : ""} />
    {:else}
      <p>Nothing was found...</p>
    {/each}
  </div>
  <!---<TheButtonThatLaunchesHalfLife steamAppId=220 text="full life" style=true></TheButtonThatLaunchesHalfLife>-->
</main> 

<style>

</style>
