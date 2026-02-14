export const apiRequest = async (url, options = {}) => {
    try {
        const defaultOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        const response = await fetch(url, mergedOptions);

        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else if (response.status !== 204) {
            data = await response.text();
        }

        if (!response.ok) {
            const errorMessage = (data && data.error) || data || `Error ${response.statusText || response.status}`;
            return [null, new Error(errorMessage)];
        }

        return [data, null];
    } catch (error) {
        console.error("API Call Error:", error);
        return [null, error instanceof Error ? error : new Error(String(error))];
    }
};
