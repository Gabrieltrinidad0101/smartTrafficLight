import mqtt from 'mqtt'

const brokerUrl = 'mqtt://mqtt:1883'
const client = mqtt.connect(brokerUrl)

client.on('connect', () => {
  console.log('Connected to MQTT broker!')

  const topic = 'frigate/events'
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('Failed to subscribe:', err)
    } else {
      console.log(`Subscribed to topic "${topic}"`)
    }
  })

  client.subscribe('frigate/tracked_object_update', (err) => {
    if (err) {
      console.error('Failed to subscribe:', err)
    } else {
      console.log(`Subscribed to topic "${topic}"`)
    }
  })
})


client.on('message', (topic, message) => {
   const data = JSON.parse(message.toString())

  if (topic === 'frigate/events' && data.after?.recognized_license_plate) {
    console.log('Placa (events):', data.after.recognized_license_plate)
  }

  if (topic === 'frigate/tracked_object_update' && data.type === 'lpr') {
    console.log('Placa (update):', data.plate)
  }
})


client.on('error', (err) => {
  console.error('MQTT error:', err)
})
