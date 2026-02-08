import mqtt from 'mqtt'
import { deleteEvent, updateEvent } from './frigateApi.js'
import { MISSING_VEHICLE, MISSING_VEHICLE_DESCRIPTION } from "./typesOfDetections.js";
import RegisteredPlate from './models/RegisteredPlate.js';

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
        if (!data?.plate) return
        const registeredPlate = await RegisteredPlate.findOne({ where: { number: data.plate } });
        if (!registeredPlate) {
          deleteEvent(data.id)
          return
        }
        await updateEvent(data.id, "/sub_label", {
          "subLabel": MISSING_VEHICLE,
          "subLabelScore": 1
        })
        await updateEvent(data.id, "/description", {
          "description": registeredPlate.description || MISSING_VEHICLE_DESCRIPTION,
        })
        this.handleExternalLPR({ ...data, registeredPlate })
      } catch (error) {
        console.error('Error parsing MQTT message:', error)
      }
    })
  }

  handleExternalLPR(lprData) {
    this.sendWhatsAppAlert(lprData)
  }

  sendWhatsAppAlert(lprData) {
    // console.log(`📱 Enviando WhatsApp para placa: ${lprData.plate}`)
  }

}

const bridge = new FrigateLPRBridge()