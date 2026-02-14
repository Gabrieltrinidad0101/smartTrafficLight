import twilio from 'twilio';

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const fromNumber = process.env.FROM_NUMBER;
const contentSid = process.env.CONTENT_SID;

const client = twilio(accountSid, authToken);

export const sendPlateAlert = async (plate, toNumber) => {
    const timestamp = new Date();
    const date = timestamp.toLocaleDateString('es-ES');
    const time = timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const message = `⚠️ *VEHÍCULO DESAPARECIDO DETECTADO* ⚠️\n\nSe ha detectado la placa: *${plate}*\nFecha: ${date}\nHora: ${time}\n\nPor favor verifique.`;

    try {
        const response = await client.messages.create({
            from: fromNumber,
            to: toNumber,
            body: message
        });
        console.log(`✅ WhatsApp alert sent to ${toNumber}: ${response.sid}`);
        return response;
    } catch (error) {
        console.warn(`⚠️ Error sending custom message to ${toNumber}, trying template: ${error.message}`);
        try {
            const contentVariables = JSON.stringify({
                "1": message
            });
            const response = await client.messages.create({
                from: fromNumber,
                contentSid: contentSid,
                contentVariables: contentVariables,
                to: toNumber
            });
            console.log(`✅ Template alert sent to ${toNumber}: ${response.sid}`);
            return response;
        } catch (templateError) {
            console.error(`❌ Failed to send WhatsApp to ${toNumber}:`, templateError.message);
        }
    }
};
