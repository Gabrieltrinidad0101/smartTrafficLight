import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/apiRequest';

const API_URL = 'http://localhost:3000/api/notifications';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        const [data, err] = await apiRequest(API_URL);
        setLoading(false);
        if (err) return;
        if (Array.isArray(data)) setNotifications(data);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const addNotification = async (notificationData) => {
        const dataToSend = {
            name: notificationData.name,
            type: notificationData.type,
            description: notificationData.description,
            whatsapps: notificationData.whatsapps || []
        };

        const [newData, err] = await apiRequest(API_URL, {
            method: 'POST',
            body: JSON.stringify(dataToSend),
        });

        if (err) return;

        setNotifications(prev => [...prev, newData]);
    };

    const updateNotification = async (id, updatedFields) => {
        const [updatedNotification, err] = await apiRequest(`${API_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedFields),
        });

        if (err) return false;

        setNotifications(prev => prev.map(n => n.id === id ? updatedNotification : n));
        return true;
    };

    const deleteNotification = async (id) => {
        if (!confirm("Are you sure you want to delete this notification?")) return;

        const [, err] = await apiRequest(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (err) return;

        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const addWhatsapp = async (id, number) => {
        const notification = notifications.find(n => n.id === id);
        if (!notification) return;

        const updatedWhatsapps = [...(notification.whatsapps || []), number];
        return updateNotification(id, { whatsapps: updatedWhatsapps });
    };

    const editWhatsapp = async (id, index, newNumber) => {
        const notification = notifications.find(n => n.id === id);
        if (!notification) return;

        const updatedWhatsapps = [...notification.whatsapps];
        updatedWhatsapps[index] = newNumber;
        return updateNotification(id, { whatsapps: updatedWhatsapps });
    };

    const deleteWhatsapp = async (id, index) => {
        if (!confirm("Delete this number?")) return;

        const notification = notifications.find(n => n.id === id);
        if (!notification) return;

        const updatedWhatsapps = notification.whatsapps.filter((_, i) => i !== index);
        return updateNotification(id, { whatsapps: updatedWhatsapps });
    };

    return {
        notifications,
        loading,
        addNotification,
        updateNotification,
        deleteNotification,
        addWhatsapp,
        editWhatsapp,
        deleteWhatsapp
    };
};
