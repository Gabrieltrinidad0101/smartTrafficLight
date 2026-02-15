// Cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

function openTweet() {
  console.log("Hello from the background script!");
  browserAPI.tabs
    .query({ active: true, currentWindow: true })
    .then(function (tabs) {
      // In Chrome, tabs query might return a callback, but we assume promise support or polyfill if using webextension-polyfill. 
      // However, native Chrome API uses callbacks for v2/v3 unless we wrap it.
      // To be safe for this specific "openTweet" legacy function, we'll try to stick to the existing logic but using browserAPI.
      // If it fails in Chrome due to missing Promise support, it's less critical than the message listener crashing.

      const url = tabs[0].url;
      const title = tabs[0].title;

      const twitterUrl =
        "https://twitter.com/intent/tweet?url=" +
        encodeURIComponent(url) +
        "&text=" +
        encodeURIComponent(title);

      browserAPI.windows.create({
        url: twitterUrl,
        width: 600,
        height: 600,
        type: "popup",
      });
    })
    .catch(err => console.error("Error in openTweet:", err));
}

// Check if onClicked exists (it should)
if (browserAPI.browserAction && browserAPI.browserAction.onClicked) {
  browserAPI.browserAction.onClicked.addListener(openTweet);
}

// Proxy fetch requests from content scripts to avoid CORS/Mixed Content issues
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'API_CALL') {
    const { url, options } = request;

    // We must return true to indicate we will send a response asynchronously.
    // However, we can't pass an async function directly to addListener in all browsers effectively if we want to use sendResponse asynchronously.
    // We'll use a wrapper logic.

    // Merge options with headers to bypass potential devtunnel warnings
    const fetchOptions = {
      ...options,
      headers: {
        ...options.headers,
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true' // For various tunnel services
      }
    };

    fetch(url, fetchOptions)
      .then(async response => {
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text;
        }

        sendResponse({
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: data
        });
      })
      .catch(error => {
        sendResponse({
          ok: false,
          error: error.message
        });
      });

    return true; // Will respond asynchronously
  }
});
