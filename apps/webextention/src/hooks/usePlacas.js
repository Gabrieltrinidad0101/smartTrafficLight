import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/placas';

export const usePlacas = () => {
    const [placas, setPlacas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlacas = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch placas');
            const data = await response.json();
            setPlacas(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlacas();
    }, []);

    const addPlaca = async (placaData) => {
        try {
            // Ensure whatsapps is an array
            const dataToSend = { ...placaData, whatsapps: placaData.whatsapps || [] };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) throw new Error('Failed to add placa');

            const newData = await response.json();
            setPlacas(prev => [...prev, newData]);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const updatePlaca = async (id, updatedFields) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFields),
            });

            if (!response.ok) throw new Error('Failed to update placa');

            const updatedPlaca = await response.json();
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
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete placa');

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
