<script>
// @ts-nocheck
    import { openUrl } from '@tauri-apps/plugin-opener';
    let {steamAppId, text, style} = $props();

    let launchUrl = "";

    function launchHalfLife() {
        if (steamAppId === "70" || steamAppId === "220" || steamAppId === "362890") {
            launchUrl = "steam://run/" + steamAppId
        } else {
            launchUrl  = "steam://run/70"
        }
        console.log(launchUrl)
        openUrl(launchUrl)
    }


</script>
<main>
    <button id="theButtonThatLaunchesHalfLife" class:theButtonThatLaunchesHalfLife={style} onclick={launchHalfLife}>{text}</button>
</main>

<style>
    .theButtonThatLaunchesHalfLife {
        padding: 0.5rem;
        border: 3px solid #E85407;
        background-color: #E85407;
        cursor: pointer;
        font-size: 150%;
    }
</style>