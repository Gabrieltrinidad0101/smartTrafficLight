import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/apiRequest';

const API_URL = 'http://localhost:3000/api/plates';

export const usePlacas = () => {
    const [placas, setPlacas] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPlacas = async () => {
        setLoading(true);
        const [data, err] = await apiRequest(API_URL);
        setLoading(false);
        if (err) return;
        if (Array.isArray(data)) setPlacas(data);
    };

    useEffect(() => {
        fetchPlacas();
    }, []);

    const addPlaca = async (placaData) => {
        const dataToSend = { ...placaData, whatsapps: placaData.whatsapps || [] };

        const [newData, err] = await apiRequest(API_URL, {
            method: 'POST',
            body: JSON.stringify(dataToSend),
        });

        console.log({err})


        if (!err) return

        setPlacas(prev => [...prev, newData]);
    };

    const updatePlaca = async (id, updatedFields) => {
        const [updatedPlaca, err] = await apiRequest(`${API_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedFields),
        });

        if (err) {
            setError(err.message);
            return false;
        }

        setPlacas(prev => prev.map(p => p.id === id ? updatedPlaca : p));
        return true;
    };

    const deletePlaca = async (id) => {
        if (!confirm("Are you sure you want to delete this plate?")) return;

        const [, err] = await apiRequest(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (err) return;

        setPlacas(prev => prev.filter(p => p.id !== id));
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
        addPlaca,
        updatePlaca,
        deletePlaca,
        addWhatsapp,
        editWhatsapp,
        deleteWhatsapp
    };
};
