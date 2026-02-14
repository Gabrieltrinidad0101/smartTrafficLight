import mqtt from 'mqtt'
import { deleteEvent, updateEvent, createEvent } from './frigateApi.js'
import { MISSING_VEHICLE, MISSING_VEHICLE_DESCRIPTION } from "./typesOfDetections.js";
import RegisteredPlate from './models/RegisteredPlate.js';
import { sendPlateAlert } from './services/notificationService.js';

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
          const registeredPlate = await RegisteredPlate.findOne({ where: { number: data.plate } })

          if (registeredPlate) {
            await createEvent(data.camera, 'vehiculo desaparecido', data.plate)
            this.sendWhatsAppAlert(data.plate, registeredPlate.whatsapps)
          }
          deleteEvent(data.id)
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error)
      }
    })
  }

  handleFrigateEvent(eventData) {
    if (eventData.after?.label === 'license_plate') {
      // console.log('Frigate detectó placa:', eventData.after.recognized_license_plate)
    }
  }

  async sendWhatsAppAlert(plate, whatsapps) {
    if (!whatsapps || whatsapps.length === 0) {
      console.log(`No WhatsApp numbers registered for plate ${plate}`);
      return;
    }

    console.log(`📱 Sending WhatsApp alerts for plate ${plate} to ${whatsapps.length} numbers...`);
    for (const number of whatsapps) {
      await sendPlateAlert(plate, number);
    }
  }

  calculateDefaultBox(cameraName) {
    const defaults = {
      'gate_camera': [100, 100, 200, 150],
      'entrance_camera': [50, 50, 150, 120],
      'exit_camera': [80, 80, 180, 140]
    }
    return defaults[cameraName] || [0, 0, 100, 100]
  }
}

const bridge = new FrigateLPRBridge()