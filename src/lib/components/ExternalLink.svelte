<script lang="ts">
	import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";

    export let link = "";
    export let text: string;
</script>

<a href={link} target="_blank">
    {text}
    <div id="icon-wrapper">
        <div id="icon">
            <Fa icon={faArrowUpRightFromSquare}/>
        </div>
    </div>
</a>

<style lang="scss">
    a {
        text-decoration: none;
        color: var(--text);

        display: flex;
        justify-content: center;

        &:hover {
            text-decoration: underline;

            #icon-wrapper {
                #icon {
                    left: 2px;
                }
            }
        }

        #icon-wrapper {
            width: 20px;
            margin-right: -23px;
            overflow: hidden;
            transform: scale(0.85);
            position: relative;
            pointer-events: none;

            #icon {
                display: flex;
                justify-content: center;
                align-items: center;
                position: absolute;
                left: -20px;
                transition: left 0.1s;
            }
        }
    }

</style>