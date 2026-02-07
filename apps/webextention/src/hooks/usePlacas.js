import { useState, useEffect } from 'react';

const API_URL = 'https://bvngsw62-3000.use2.devtunnels.ms/api/plates';

const apiRequest = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        const message = {
            type: 'API_CALL',
            url,
            options
        };

        const handleResponse = (response) => {
            // Check for runtime errors first if possible (Chrome specific mostly)
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
                console.error("Runtime error:", chrome.runtime.lastError);
                return reject(new Error(chrome.runtime.lastError.message));
            }

            if (!response) {
                return reject(new Error('No response from background script (extension might need reloading)'));
            }
            if (!response.ok) {
                return reject(new Error(response.error || `Error ${response.statusText || response.status}`));
            }
            resolve(response.data);
        };

        // Try Chrome API first (supports callback)
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(message, handleResponse);
        }
        // Fallback to Browser API (Firefox Promises)
        else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
            browser.runtime.sendMessage(message)
                .then(handleResponse)
                .catch(err => reject(new Error(err.message || 'Message passing failed')));
        } else {
            reject(new Error('Browser extension runtime not found'));
        }
    });
};

export const usePlacas = () => {
    const [placas, setPlacas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlacas = async () => {
        setLoading(true);
        try {
            const data = await apiRequest(API_URL);
            if (Array.isArray(data)) {
                setPlacas(data);
                setError(null);
            } else {
                console.error("Fetched data is not an array:", data);
                setPlacas([]);
            }
        } catch (err) {
            console.error("Fetch placas error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlacas();
    }, []);

    const addPlaca = async (placaData) => {
        try {
            const dataToSend = { ...placaData, whatsapps: placaData.whatsapps || [] };

            const newData = await apiRequest(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            setPlacas(prev => [...prev, newData]);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const updatePlaca = async (id, updatedFields) => {
        try {
            const updatedPlaca = await apiRequest(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFields),
            });
            setPlacas(prev => prev.map(p => p.id === id ? updatedPlaca : p));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const deletePlaca = async (id) => {
        if (!confirm("Are you sure you want to delete this plate?")) return;

        try {
            await apiRequest(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            setPlacas(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const addWhatsapp = async (id, number) => {
        const placa = placas.find(p => p.id === id);
        if (!placa) return;

        const updatedWhatsapps = [...(placa.whatsapps || []), number];
        return updatePlaca(id, { whatsapps: updatedWhatsapps });
    };

    const editWhatsapp = async (id, index, newNumber) => {
        const placa = placas.find(p => p.id === id);
        if (!placa) return;

        const updatedWhatsapps = [...placa.whatsapps];
        updatedWhatsapps[index] = newNumber;
        return updatePlaca(id, { whatsapps: updatedWhatsapps });
    };

    const deleteWhatsapp = async (id, index) => {
        if (!confirm("Delete this number?")) return;

        const placa = placas.find(p => p.id === id);
        if (!placa) return;

        const updatedWhatsapps = placa.whatsapps.filter((_, i) => i !== index);
        return updatePlaca(id, { whatsapps: updatedWhatsapps });
    };

    return {
        placas,
        loading,
        error,
        addPlaca,
        updatePlaca,
        deletePlaca,
        addWhatsapp,
        editWhatsapp,
        deleteWhatsapp
    };
};
