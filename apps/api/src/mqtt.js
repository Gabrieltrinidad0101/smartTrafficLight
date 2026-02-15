import mqtt from 'mqtt'
import { deleteEvent, updateEvent, createEvent } from './frigateApi.js'
import { MISSING_VEHICLE, MISSING_VEHICLE_DESCRIPTION } from "./typesOfDetections.js";
import Notification from './models/Notification.js';
import { sendAlert } from './services/notificationService.js';

class FrigateLPRBridge {
  constructor() {
    this.client = mqtt.connect('mqtt://mqtt:1883')
    this.setupMQTT()
  }

  setupMQTT() {
    this.client.on('connect', () => {
      console.log('Connected to Frigate MQTT')

      this.client.subscribe('frigate/events')
      this.client.subscribe('frigate/tracked_object_update')
    })

    this.client.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString())

        if (data?.plate) {
          const entity = await Notification.findOne({ where: { name: data.plate, type: 'plate' } })

          if (entity) {
            await createEvent(data.camera, 'vehiculo desaparecido', data.plate)
            this.sendWhatsAppAlerts('plate', data.plate, data.camera, entity.whatsapps)
          }
          deleteEvent(data.id)
        } else if (data?.after?.label === 'person' && data.after.sub_label) {
          const personName = data.after.sub_label;
          const cameraName = data.after.camera;
          const entity = await Notification.findOne({ where: { name: personName, type: 'person' } });

          if (entity) {
            await createEvent(cameraName, 'persona buscada encontrada', personName);
            this.sendWhatsAppAlerts('person', personName, cameraName, entity.whatsapps);
          }
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error)
      }
    })
  }

  async sendWhatsAppAlerts(type, name, cameraName, whatsapps) {
    if (!whatsapps || whatsapps.length === 0) {
      console.log(`No WhatsApp numbers registered for ${type} ${name}`);
      return;
    }

    console.log(`Sending WhatsApp alerts for ${type} ${name} to ${whatsapps.length} numbers...`);
    for (const number of whatsapps) {
      await sendAlert(type, name, cameraName, number);
    }
  }

}

const bridge = new FrigateLPRBridge()
