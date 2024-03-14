<script lang="ts">
	import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";

    export let link = "";
    export let text;
</script>

<a href={link}>{text} <Fa icon={faArrowUpRightFromSquare}/></a>

<style lang="scss">
    a {
        text-decoration: none;
        color: var(--text);
        margin: 0 5px;
    }

    a :hover {
        text-decoration: underline;
    }
</style>