import twilio from 'twilio';

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const toNumber = process.env.TO_NUMBER;
const fromNumber = process.env.FROM_NUMBER;
const contentSid = process.env.CONTENT_SID;

const client = twilio(accountSid, authToken);

export const sendAccidentNotification = async (req, res) => {
    try {
        let { message } = req.body;

        console.log(`Sending WhatsApp notification to ${toNumber}...`);

        // Use custom message body for Spanish text
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
            // If custom message fails (e.g. outside 24h window), try template as fallback
            // Note: Template doesn't support custom text easily without changing variables
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
