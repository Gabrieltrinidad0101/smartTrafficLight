import React from 'react';
import { createRoot } from 'react-dom/client';
import Notifications from './component/Notifications';
import NotificationsSent from './component/NotificationsSent';
import { addMenuButton } from './component/menuButton';


const pages = {
    '#notifications': Notifications,
    '#notifications-sent': NotificationsSent,
}

setTimeout(() => {
    const menuButtons = [
        {
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
            onclick: () => {
                window.location.hash = 'notifications';
            }
        },
        {
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17H2a3 3 0 003-3V9a7 7 0 0114 0v5a3 3 0 003 3zm-8.27 4a2 2 0 01-3.46 0"></path></svg>`,
            onclick: () => {
                window.location.hash = 'notifications-sent';
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

    if (pages[window.location.hash]) {
        handleHashChange()
    }


    window.addEventListener('hashchange', handleHashChange);
    menuButtons.forEach(button => addMenuButton(button));
}, 1000);
