<div class="main">
    <header>
        <div>
            <h1>
                mfp
            </h1>
            <div id="header-center">
                Never Gonna Give You Up - Rick Astly
            </div>
            <div>
                placeholder
            </div>
        </div>
    </header>
    <div class="content">
        <slot></slot>
    </div>
    <footer>
        <div>
            <div>
                &copy 2024 Jan Bessler
            </div>
            <div>
                <a href="https://github.com/Jaybee18/mfp">GitHub</a>
                <a href="https://www.instagram.com/jaybes.mg/">Instagram</a>
                <a href="https://twitter.com/JanBessler">X</a>
            </div>
        </div>
    </footer>
</div>

<style lang="scss">
    @import '../lib/components/abstracts/variables';

    .main {
    width: 70%;
    height: 100%;
    display: flex;
    flex-direction: column;

    background-color: var(--background);
    }

    .content {
        flex: 1;
        overflow: hidden;
    }

    footer {
        height: 100px;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;

        color: $text-color;
        font-family: 'Courier New', Courier, monospace;

        div {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            a {
                text-decoration: none;
                color: var(--text);
                margin: 0 5px;
            }

            a :hover {
                text-decoration: underline;
            }
        }
    }

    header {
        height: 100px;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;

        color: $text-color;
        font-family: 'Courier New', Courier, monospace;

        * {
            margin: 0;
        }

        div {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            * {
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            #header-center {
                flex: 1;
            
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
            }
        }

    }
</style>