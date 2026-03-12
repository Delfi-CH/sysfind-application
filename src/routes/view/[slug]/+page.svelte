<script>
    import { resolve } from '$app/paths';
    import Navbar from '$lib/components/Navbar.svelte';
    import OsViewer from '$lib/components/OsViewer.svelte';

// @ts-nocheck

    let { data } = $props()
</script>

<main>
    <Navbar></Navbar>
    <OsViewer os={data.os}></OsViewer>
</main>