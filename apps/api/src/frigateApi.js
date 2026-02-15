import axios from "axios"

const FRIGATE_URL = process.env.FRIGATE_URL || 'http://frigate:5000';

export async function updateEvent(eventId, path, data) {
    setTimeout(async () => {

        const endpoint = `${FRIGATE_URL}/api/events/${eventId}/${path}`;
        try {
            const response = await axios.post(endpoint, data);
            console.log(`✅ Event ${eventId} updated successfully.`);
            return response.data;
        } catch (error) {
            console.log(error)
            handleError(error, eventId);
        }
    }, 3000)
}

export async function createEvent(camera, label, subLabel) {
    const endpoint = `${FRIGATE_URL}/api/events/${camera}/${label}/create`;
    try {
        const response = await axios.post(endpoint, {
            sub_label: subLabel
        });
        console.log(`✅ Event created for camera ${camera} with sub_label ${subLabel}.`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error creating event for ${camera}:`, error.message);
        return null;
    }
}

/**
 * Deletes an event from Frigate
 * @param {string} eventId - The ID of the event to delete
 * @param {Object} options - Configuration options
 * @param {string} options.baseUrl - Frigate base URL (default: http://10.0.0.138:5000)
 * @param {Object} options.axiosConfig - Additional axios configuration
 * @returns {Promise<Object|null>} Response data or null on error
 */
export async function deleteEvent(eventId, options = {}) {
    setTimeout(async () => {
        const { axiosConfig = {} } = options;

        const endpoint = `${FRIGATE_URL}/api/events/${eventId}`;

        try {
            const response = await axios.delete(endpoint, axiosConfig);
            console.log(`✅ Event ${eventId} deleted successfully.`);
            return response.data;
        } catch (error) {
            handleError(error, eventId);
            return null;
        }
    }, 3000)
}
const THREE_HOURS = 3 * 60 * 60 * 1000;

async function deleteAllEvents() {
    try {
        const response = await axios.get(`${FRIGATE_URL}/api/events`);
        const events = response.data;
        if (!events || events.length === 0) {
            console.log('No events to delete.');
            return;
        }
        console.log(`Deleting ${events.length} events from Frigate...`);
        for (const event of events) {
            try {
                await axios.delete(`${FRIGATE_URL}/api/events/${event.id}`);
            } catch (err) {
                console.error(`Failed to delete event ${event.id}: ${err.message}`);
            }
        }
        console.log('All events deleted.');
    } catch (error) {
        console.error('Error fetching events from Frigate:', error.message);
    }
}

setInterval(deleteAllEvents, THREE_HOURS);
deleteAllEvents();

function handleError(error, eventId) {
    if (error.response) {
        // Server responded with error status
        console.error(`❌ Failed to event ${eventId}:`);
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Message: ${error.response.data?.message || 'No additional info'}`);

        // Common errors
        if (error.response.status === 404) {
            console.error(`   → Event ${eventId} not found. It may have been deleted already.`);
        } else if (error.response.status === 400) {
            console.error(`   → Bad request. Check the event ID format.`);
        } else if (error.response.status === 500) {
            console.error(`   → Frigate server error. Check Frigate logs.`);
        }
    } else if (error.request) {
        // No response received
        console.error(`❌ No response from Frigate server at ${FRIGATE_URL}`);
        console.error(`   → Check if Frigate is running and accessible.`);
    } else {
        // Setup error
        console.error(`❌ Request setup error:`, error.message);
    }
}