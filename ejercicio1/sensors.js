class Sensor {
    constructor(id, name, type, value, unit, updated_at) {
        this.id = id;
        this.name = name;
        this.type = this.validateType(type);
        this.value = value;
        this.unit = unit;
        this.updated_at = updated_at;
    }

    // Validate sensor type
    validateType(type) {
        const allowedTypes = ['temperature', 'humidity', 'pressure'];
        if (!allowedTypes.includes(type)) {
            throw new Error(`Invalid sensor type: ${type}`);
        }
        return type;
    }

    // Setter to update value and updated_at
    set updateValue(newValue) {
        this.value = newValue;
        this.updated_at = new Date().toISOString();
    }
}

class SensorManager {
    constructor() {
        this.sensors = [];
    }

    // Asynchronous method to load sensors from a JSON file
    async loadSensors(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`Failed to load sensors from ${jsonPath}`);
            }
            const data = await response.json();
            this.sensors = data.map(sensor => new Sensor(sensor.id, sensor.name, sensor.type, sensor.value, sensor.unit, sensor.updated_at));
            this.render();
        } catch (error) {
            console.error('Error loading sensors:', error);
            document.getElementById('sensors-list').innerHTML = `<p>Error loading sensors: ${error.message}</p>`;
        }
    }

    // Method to render the sensors to the HTML
    render() {
        const sensorsList = document.getElementById('sensors-list');
        sensorsList.innerHTML = '';
        this.sensors.forEach(sensor => {
            const sensorDiv = document.createElement('div');
            sensorDiv.classList.add('sensor');
            sensorDiv.innerHTML = `
                <h2>${sensor.name}</h2>
                <p>Type: ${sensor.type}</p>
                <p>Value: ${sensor.value} ${sensor.unit}</p>
                <p>Last Updated: ${sensor.updated_at}</p>
            `;
            sensorsList.appendChild(sensorDiv);
        });
    }

    // Simulate real-time updates
    simulateRealTimeUpdates() {
        setInterval(() => {
            this.sensors.forEach(sensor => {
                // Generate a random new value for the sensor
                const newValue = this.generateRandomValue(sensor.type);
                sensor.updateValue = newValue;
            });
            this.render();
        }, 5000); // Update every 5 seconds
    }

    // Generate a random value based on sensor type
    generateRandomValue(type) {
        switch (type) {
            case 'temperature':
                return (Math.random() * 40).toFixed(1); // Random temperature between 0 and 40
            case 'humidity':
                return (Math.random() * 100).toFixed(1); // Random humidity between 0 and 100
            case 'pressure':
                return (Math.random() * 50 + 1000).toFixed(0); // Random pressure between 1000 and 1050
            default:
                return 0;
        }
    }
}

// Instantiate SensorManager and load sensors
const sensorManager = new SensorManager();
sensorManager.loadSensors('sensors.json')
    .then(() => {
        sensorManager.simulateRealTimeUpdates(); // Start real-time updates after loading sensors
    });
