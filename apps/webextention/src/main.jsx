import React from 'react';
import { createRoot } from 'react-dom/client';
import Placas from './component/Placas';

const container = document.getElementById('placas-view-root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <Placas />
        </React.StrictMode>
    );
} else {
    // If we can't find the root, we might need to create it or wait for it.
    // In the context of the extension, content.js usually injects a div.
    console.error('Root element #placas-view-root not found');
}
