<script>
// @ts-nocheck

  import { invoke } from "@tauri-apps/api/core";
  import {getAllOs, downloadFile} from "$lib/fetch.js"
  import { onMount } from 'svelte';
  import OsViewer from "$lib/components/OsViewer.svelte";

  let name = $state("");
  let greetMsg = $state("");

  async function greet(event) {
    event.preventDefault();
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsg = await invoke("greet", { name });
  }

  let data = $state([{}])
  let data2 = $state()

  onMount(async ()=> {
    const result = await getAllOs()
    data = result
    const res2 = await downloadFile("https://delfi.dev", "delfi.html")
    console.log(res2)
    data2 = res2
  })

  

</script>

<main class="container">
  <h1>sysfind</h1>

  <form class="row" onsubmit={greet}>
    <input id="greet-input" placeholder="Enter a name..." bind:value={name} />
    <button type="submit">Greet</button>
  </form>
  <p>{greetMsg}</p>
  <p>{data2}</p>

  {#each data as os (os.id)}
    <OsViewer os={os}></OsViewer>
  {/each}
</main>

<style>

</style>
