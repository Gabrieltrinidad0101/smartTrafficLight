export const apiRequest = (url, options) => {
    return new Promise((resolve) => {
        const message = {
            type: 'API_CALL',
            url,
            options: {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: null,
                ...options
            }
        };

        const handleResponse = (response) => {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
                console.error("Runtime error:", chrome.runtime.lastError);
                return resolve([null, new Error(chrome.runtime.lastError.message)]);
            }

            if (!response) {
                return resolve([null, new Error('No response from background script (extension might need reloading)')]);
            }
            if (!response.ok) {
                return resolve([null, new Error(response.error || `Error ${response.statusText || response.status}`)]);
            }
            resolve([response.data, null]);
        };

        const handleError = (err) => {
            resolve([null, new Error(err.message || 'Message passing failed')]);
        };

        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            try {
                chrome.runtime.sendMessage(message, handleResponse);
            } catch (e) {
                handleError(e);
            }
        }

        else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
            browser.runtime.sendMessage(message)
                .then(handleResponse)
                .catch(handleError);
        } else {
            resolve([null, new Error('Browser extension runtime not found')]);
        }
    });
};
