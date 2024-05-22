<script lang="ts">
    let current_element: HTMLElement | null = null;
    let down_x: number = 0;
    let down_y: number = 0;
    let drag = false;

    const handle_down = (e: MouseEvent) => {
        if (e.target instanceof HTMLElement) {
            current_element = e.target.parentElement;
            drag = true;
        }
    }

    const window_move = (e: MouseEvent) => {
        if (!drag) return;
        if (current_element === null) return;

        down_x += e.movementX;
        down_y += e.movementY;
    }

    const onMouseUp = () => {
        drag = false;
    }
</script>

<svelte:window on:mousemove={window_move} on:mouseup={onMouseUp}/>
<div id="main">
    <div class="plugin-anchor" style="width: 258px; height: 284px;">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="plugin" draggable="false" style="left: {down_x}px; top: {down_y}px;" on:mousedown|preventDefault>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div on:mousedown={handle_down} class="plugin-handle" style="height: 30px;"></div>
            <img src="/waveshaper.png" alt="waveshaper plugin">
        </div>
        <div class="background-content">
            where'd my<br>
            plugin go?
            <br>
            <br>
            &nbsp;&nbsp;&nbsp;&nbsp;／l、       <br>      
            （ﾟ､ ｡ ７      <br>   
            &nbsp;&nbsp;&nbsp;&nbsp;l  ~ヽ       <br>
            &nbsp;&nbsp;&nbsp;じしf_,)ノ
        </div>
    </div>
    <p>
        The Waveshaper plugin is currently under development, but will soon be released!
    </p>
</div>

<style lang="scss">
    .plugin-anchor {
        position: relative;
        outline: 1px solid #00000096;
        outline-offset: -2px;
        width: fit-content;
        height: fit-content;
        border: 1px solid #ffffff17;
        border-radius: 4px;
        box-shadow: inset 0 0 19px 4px black;
        background-image:  repeating-linear-gradient(45deg, #bbb 25%, transparent 25%, transparent 75%, #bbb 75%, #bbb), repeating-linear-gradient(45deg, #bbb 25%, #ddd 25%, #ddd 75%, #bbb 75%, #bbb);
        background-position: 0 0, 10px 10px;
        background-size: 20px 20px;
        background-clip: content-box;

        .plugin {
            position: absolute;
            box-shadow: 0 0 0 0 #00000059;
            user-select: none;
            transition: box-shadow 0.15s, transform 0.15s;
            
            &:hover {
                box-shadow: 0 0 15px 0px #00000059;
                transform: scale(1.02);
            }
    
            .plugin-handle {
                position: absolute;
                width: 100%;
                pointer-events: all!important;
                cursor: grab;
            }
    
            img {
                display: block;
                margin: -1px 0 0 -1px;
                border: 1px solid #00000047;
                border-radius: 4px;
            }
        }

        .background-content {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            line-height: 1.15em;
            font-weight: 500;
        }
    }
</style>