<script>
// @ts-nocheck

  import {getAllOs } from "$lib/fetch.js"
  import { onMount } from 'svelte';
  import OsViewer from "$lib/components/OsViewer.svelte";
  import TheButtonThatLaunchesHalfLife from "$lib/components/TheButtonThatLaunchesHalfLife.svelte";
  import {resolve} from "$app/paths";
    import Navbar from "$lib/components/Navbar.svelte";


  let data = $state([{}])

  onMount(async ()=> {
    const result = await getAllOs()
    data = result
  })

</script>

<main class="container">
  <Navbar></Navbar>

  <ul>
    {#each data as os (os.id)}
      <li>{os.name} {os.version} <a href={resolve("/view/"+os.id)}>View</a></li>
    {/each}
  </ul>
  <!---<TheButtonThatLaunchesHalfLife steamAppId=220 text="full life" style=true></TheButtonThatLaunchesHalfLife>-->
</main>

<style>

</style>
