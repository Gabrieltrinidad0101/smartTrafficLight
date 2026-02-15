import Notification from '../models/Notification.js';
import twilio from 'twilio';

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const toNumber = process.env.TO_NUMBER;
const fromNumber = process.env.FROM_NUMBER;
const contentSid = process.env.CONTENT_SID;

const client = twilio(accountSid, authToken);

export const createNotification = async (req, res) => {
    try {
        const { name, type, description, active, whatsapps } = req.body;
        const notification = await Notification.create({ name, type, description, active, whatsapps });
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllNotifications = async (req, res) => {
    try {
        const { type } = req.query;
        const where = type ? { type } : {};
        const notifications = await Notification.findAll({ where });
        return res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, description, active, whatsapps } = req.body;
        const notification = await Notification.findByPk(id);
        if (!notification) return res.status(404).json({ error: 'Notification not found' });

        if (name !== undefined) notification.name = name;
        if (type !== undefined) notification.type = type;
        if (description !== undefined) notification.description = description;
        if (active !== undefined) notification.active = active;
        if (whatsapps !== undefined) notification.whatsapps = whatsapps;

        await notification.save();
        res.status(200).json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);
        if (!notification) return res.status(404).json({ error: 'Notification not found' });

        await notification.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendAccidentNotification = async (req, res) => {
    try {
        let { message } = req.body;

        console.log(`Sending WhatsApp notification to ${toNumber}...`);

        const spanishMessage = `⚠️ *ALERTA DE ACCIDENTE* ⚠️\n\nSe ha detectado un posible accidente de tráfico.\nFecha: ${date}\nHora: ${time}\n\nPor favor verifique la situación.`;

        try {
            const messageOptions = {
                from: fromNumber,
                to: toNumber,
                body: spanishMessage
            };

            const message = await client.messages.create(messageOptions);
            console.log(`WhatsApp message sent: ${message.sid}`);

            res.status(200).json({ success: true, message: 'Notification sent successfully.', sid: message.sid });

        } catch (error) {
            console.log("Error sending custom message, falling back to template if applicable or logging error: " + error.message);
            const contentVariables = JSON.stringify({
                "1": date,
                "2": time
            });
            const message = await client.messages.create({
                from: fromNumber,
                contentSid: contentSid,
                contentVariables: contentVariables,
                to: toNumber
            });
            console.log(`Fallback template message sent: ${message.sid}`);
            res.status(200).json({ success: true, message: 'Template notification sent (fallback).', sid: message.sid });
        }

    } catch (error) {
        console.error(`Error sending WhatsApp notification: ${error}`);
        res.status(500).json({ success: false, message: 'Failed to send notification.', error: error.message });
    }
};
