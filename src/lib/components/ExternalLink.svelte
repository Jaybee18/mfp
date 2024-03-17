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
        margin: 0 2.5px;

        display: flex;
        justify-content: center;

        &:hover {
            text-decoration: underline;

            #icon-wrapper {
                #icon {
                    margin-left: 0px;
                }
            }
        }

        #icon-wrapper {
            margin-left: 4px;
            width: 20px;
            overflow: hidden;
            transform: scale(0.85);

            #icon {
                margin-left: -20px;
                transition: margin-left 0.1s;
            }
        }
    }

</style>