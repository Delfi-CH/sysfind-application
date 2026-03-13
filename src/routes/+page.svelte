<script>
// @ts-nocheck

  import {getAllOs } from "$lib/fetch.js"
  import { onMount } from 'svelte';
  import TheButtonThatLaunchesHalfLife from "$lib/components/TheButtonThatLaunchesHalfLife.svelte";
  import {resolve} from "$app/paths";
  import Navbar from "$lib/components/Navbar.svelte";
  import OsListItem from "$lib/components/OsListItem.svelte";


  let data = $state([{}])

  onMount(async ()=> {
    const result = await getAllOs()
    data = result
  })

</script>

<main class="container">
  <Navbar></Navbar>

  <div>
    {#each data as os (os.id)}
      <OsListItem os={os}></OsListItem>
    {/each}
  </div>
  <!---<TheButtonThatLaunchesHalfLife steamAppId=220 text="full life" style=true></TheButtonThatLaunchesHalfLife>-->
</main>

<style>

</style>
