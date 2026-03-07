import paho.mqtt.client as mqtt

class IoTCommunicator:
    def __init__(self, broker="localhost", port=1883):
        self.broker = broker
        self.port = port
        self.last_state = None
        self.client = mqtt.Client()
        
        try:
            self.client.connect(self.broker, self.port)
            self.client.loop_start()
            print(f"✅ MQTT Connected! The Broker at {self.broker}:{self.port} is alive.")
        except ConnectionRefusedError:
            print("🚨 MQTT ERROR: Could not connect! Did you forget to run 'mosquitto' in the terminal?")

    def control_appliances(self, room_id, waste_detected):
        command = "OFF" if waste_detected else "ON"
        
        if command != self.last_state:
            topic = f"wattwatch/{room_id}/power/cmd"
            self.client.publish(topic, command)
            print(f"⚡ IoT Signal Sent -> {topic}: {command}")
            self.last_state = command