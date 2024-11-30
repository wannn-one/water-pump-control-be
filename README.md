# 🚰 Water Pump Control Backend

## 🌐 Overview

Water Pump Control Backend is a RESTful API that allows users to monitor & control water pumps. It is built using MongoDB, Express, Node.js and MQTT for communication with the IoT devices (In this case ESP32).

## 🔗 Base URL

The base URL for the API is `http://localhost:3000/api`.

---

## 🛠 API Endpoints

### 🖥️ Devices

#### Get All Devices

- **URL:** `/devices`
- **Method:** `GET`
- **Description:** Get all devices
- **Response:** Returns an array of devices

#### Get Device by ID

- **URL:** `/devices/:id`
- **Method:** `GET`
- **Description:** Get a device by ID
- **Response:** Returns a device

#### Add Device

- **URL:** `/devices`
- **Method:** `POST`
- **Description:** Add a new device
- **Request Body:** 
    ```json
    {
        "deviceId": "ESP32-03", // Required and Unique
        "name": "Pump2", // Required
        "type": "ESP_PLC", // Required [ESP_PLC, ESP_WATERLEVEL] 
        // PLC for Pump Control, WATERLEVEL for Water Level Sensor
        "location": "Gedung A, Lantai 10", // Optional
        "status": "INACTIVE" // Required [ACTIVE, INACTIVE, MAINTENANCE]
    }
    ```
- **Response:** message: "Device created successfully", device: {savedDevice}

#### Update Device

- **URL:** `/devices/:id`
- **Method:** `PUT`
- **Description:** Update a device by ID
- **Request Body:** 
    ```json
    {
        "name": "Pump2", // Required
        "type": "ESP_PLC", // Required [ESP_PLC, ESP_WATERLEVEL] 
        // PLC for Pump Control, WATERLEVEL for Water Level Sensor
        "location": "Gedung A, Lantai 10", // Optional
        "status": "INACTIVE" // Required [ACTIVE, INACTIVE, MAINTENANCE]
    }
    ```
- **Response:** message: "Device updated successfully", device: {updatedDevice}

#### Delete Device

- **URL:** `/devices/:id`
- **Method:** `DELETE`
- **Description:** Delete a device by ID
- **Response:** message: "Device deleted successfully"

### Health Check

#### Health Check

- **URL:** `/`
- **Method:** `GET`
- **Description:** Health Check
- **Response:** message: "Welcome to IoT API"

### 💧 Pumps

#### Toggle Pump (ON/OFF)

- **URL:** `/:pumpId/toggle`
- **Method:** `PUT`
- **Description:** Toggle a pump by ID
- **Request Body:** 
    ```json
    {
        "action": "ON" // Required [ON, OFF]
    }
    ```
- **Response:** message: "Pump ${action} (ON/OFF) successfully"
- **MQTT Publish:** `pump/${pumpId}/control` with response `{ action: 'ON' }` or `{ action: 'OFF' }` based on the request body

#### Mode Pump (AUTO/MANUAL)

- **URL:** `/:pumpId/mode`
- **Method:** `PUT`
- **Description:** Set a pump mode by ID
- **Request Body:** 
    ```json
    {
        "mode": "AUTO" // Required [AUTO, MANUAL]
    }
    ```
- **Response:** message: "Pump mode set to ${mode} (AUTO/MANUAL) successfully"
- **MQTT Publish:** `pump/${pumpId}/control` with response `{ mode: 'AUTO' }` or `{ mode: 'MANUAL' }` based on the request body

#### Pump History

- **URL:** `/:pumpId/history`
- **Method:** `GET`
- **Description:** Get pump history by ID
- **Response:** Returns an array of pump history

### 🌊 Water Levels

#### Set Water Level Range

- **URL:** `/:sensorId/setRange`
- **Method:** `PUT`
- **Description:** Set a water level range by ID
- **Request Body:** 
    ```json
    {
        "rangeMin": 10, // Required
        "rangeMax": 100 // Required
    }
    ```
- **Response:** message: "Range set successfully", sensor
- **MQTT Publish:** `sensor/${sensorId}/control` with response `{ rangeMin: 10, rangeMax: 100 }` based on the request body

#### Water Level Update Last Read

- **URL:** `/:sensorId/updateLastReading`
- **Method:** `PUT`
- **Description:** Update last reading of water level by ID
- **Request Body:** 
    ```json
    {
        "lastReading": 50 // Required
    }
    ```
- **Response:** message: "Last reading and condition for sensor ${sensorId} updated successfully", sensor

#### Water Level History

- **URL:** `/:sensorId/history`
- **Method:** `GET`
- **Description:** Get water level history by ID
- **Response:** Returns an array of water level history

## ⚙️ Setup Instructions

1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    MONGODB_URL=<YOUR_MONGODB_URL>
    PORT=3000
    MQTT_BROKER_URL="broker.emqx.io"
    MQTT_BROKER_PORT=1883
    ```
4. Run `npm run start:dev` to start the server in development mode
5. The server will be running on `http://localhost:3000/api`