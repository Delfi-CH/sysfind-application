<script>
    import { resolve } from "$app/paths";


</script>

<main>
    <div class="navbar">
        <h1 class="navbarItem">sysfind.app</h1>
        <p class="navbarItem"><a href={resolve("/")}>Go home</a></p>
    </div>
</main>

<style>
    .navbar {
        display: flex;
        flex-direction: row;
    }
    .navbarItem {
        padding: 0.2rem;
        margin: 0.2rem;
        height: 100%;
        text-align: center;
    }
</style>