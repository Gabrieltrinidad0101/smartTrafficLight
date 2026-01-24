setTimeout(() => {
    const svgContent = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 496 512"
                class="size-5 md:m-[6px]" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zM88 256H56c0-105.9 86.1-192 192-192v32c-88.2 0-160 71.8-160 160zm160 96c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z">
                </path>
            </svg>`;

    addMenuButton({
        svg: svgContent,
        onclick: () => {
            window.location.href = "/#placas"
        }
    });

    let placasView = "";
    const urlUrl = browser.runtime.getURL("src/component/placasView.html");
    fetch(urlUrl)
        .then(response => response.text())
        .then(data => {
            placasView = data;
        });

    setInterval(() => {
        if (window.location.href.includes("#placas")) {
            console.log("URL matches #placas");

            if (!placasView) {
                console.log("placasView HTML not loaded yet");
                return;
            }

            const container = document.querySelector("#pageRoot");
            if (!container) {
                console.log("Container #pageRoot not found");
                return;
            }

            const alreadyInjected = document.getElementById("placas-view-root");
            if (!alreadyInjected) {
                console.log("Injecting placas view...");
                container.innerHTML = placasView;

                if (typeof placasLogic !== 'undefined') {
                    console.log("Initializing placasLogic");
                    placasLogic.init();
                } else {
                    console.error("placasLogic is undefined!");
                }
            }
        }
    }, 500);
}, 1000);