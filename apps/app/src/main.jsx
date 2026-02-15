import React from 'react';
import { createRoot } from 'react-dom/client';
import Placas from './component/Placas';
import { addMenuButton } from './component/menuButton';


const pages = {
    '#plate-numbre': Placas,
}

setTimeout(() => {
    const menuButtons = [
        {
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
            onclick: () => {
                window.location.hash = 'plate-numbre';
            }
        }
    ];

    let root = null;

    const handleHashChange = () => {
        root?.unmount();
        const Page = pages[window.location.hash];
        if (!Page) {
            window.location.reload();
            return;
        }
        const container = document.getElementById('pageRoot');
        if (!container) return;
        root = createRoot(container);
        root.render(
            <React.StrictMode>
                <Page />
            </React.StrictMode>
        );
    };

    if (window.location.hash == "#plate-numbre") {
        handleHashChange()
    }


    window.addEventListener('hashchange', handleHashChange);
    menuButtons.forEach(button => addMenuButton(button));
}, 1000);