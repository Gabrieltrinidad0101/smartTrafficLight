import axios from "axios"

export async function updateEvent(eventId, path, data) {
    setTimeout(async () => {

        const endpoint = `http://10.0.0.138:5000/api/events/${eventId}/${path}`;
        try {
            const response = await axios.post(endpoint, data);
            console.log(`✅ Event ${eventId} updated successfully.`);
            return response.data;
        } catch (error) {
            console.log(error)
            handleError(error, eventId, baseUrl);
        }
    }, 3000)
}

export async function createEvent(camera, label, subLabel) {
    const endpoint = `http://frigate:5000/api/events/${camera}/${label}/create`;
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
        const {
            baseUrl = 'http://10.0.0.138:5000',
            axiosConfig = {}
        } = options;

        const endpoint = `${baseUrl}/api/events/${eventId}`;

        try {
            const response = await axios.delete(endpoint, axiosConfig);
            console.log(`✅ Event ${eventId} deleted successfully.`);
            return response.data;
        } catch (error) {
            handleError(error, eventId, baseUrl);
            return null;
        }
    }, 3000)
}

/**
 * Handles errors for event deletion
 * @param {Error} error - The axios error
 * @param {string} eventId - The event ID
 * @param {string} baseUrl - The Frigate base URL
 */
function handleError(error, eventId, baseUrl) {
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
        console.error(`❌ No response from Frigate server at ${baseUrl}`);
        console.error(`   → Check if Frigate is running and accessible.`);
    } else {
        // Setup error
        console.error(`❌ Request setup error:`, error.message);
    }
}