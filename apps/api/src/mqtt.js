import mqtt from 'mqtt'
import { deleteEvent, updateEvent } from './frigateApi.js'
import { MISSING_VEHICLE, MISSING_VEHICLE_DESCRIPTION } from "./typesOfDetections.js";

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
        if (data?.plate === "AK64DMV") {
          await updateEvent(data.id, "/sub_label", {
            "subLabel": MISSING_VEHICLE,
            "subLabelScore": 1
          })
          await updateEvent(data.id, "/description", {
            "description": MISSING_VEHICLE_DESCRIPTION,
          })
          this.handleExternalLPR(data)
          return
        }
        if (data?.plate) {
          deleteEvent(data.id)
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error)
      }
    })
  }

  handleExternalLPR(lprData) {
    this.sendWhatsAppAlert(lprData)
  }

  handleFrigateEvent(eventData) {
    if (eventData.after?.label === 'license_plate') {
      // console.log('Frigate detectó placa:', eventData.after.recognized_license_plate)
    }
  }

  sendWhatsAppAlert(lprData) {
    // console.log(`📱 Enviando WhatsApp para placa: ${lprData.plate}`)
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