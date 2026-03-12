<script>
// @ts-nocheck

  import {getAllOs } from "$lib/fetch.js"
  import { onMount } from 'svelte';
  import OsViewer from "$lib/components/OsViewer.svelte";

  let data = $state([{}])

  onMount(async ()=> {
    const result = await getAllOs()
    data = result
  })

</script>

<main class="container">
  <h1>sysfind</h1>

  {#each data as os (os.id)}
    <OsViewer os={os}></OsViewer>
  {/each}
</main>

<style>

</style>
