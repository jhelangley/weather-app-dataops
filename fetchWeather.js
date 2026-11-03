// this file fetches real-time weather data from an external API, and saves the information in a CSV file

import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'
dotenv.config()

// creates the path and normalises it works on all operating systems
const DATA_DIR = path.join(import.meta.dirname, 'data')

// creates the directory at the above path
fs.mkdirSync(DATA_DIR, { recursive: true })

// creates two files within the directory
const WEATHER_FILE = path.join(DATA_DIR, 'weather.json')
const LOG_FILE = path.join(DATA_DIR, 'weather_log.csv')



export async function fetchWeather() {
    const apiKey = process.env.WEATHER_API_KEY
    const city = process.env.CITY
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        const nowUTC = new Date().toISOString()
        data._last_updated_utc = nowUTC
        fs.writeFileSync(WEATHER_FILE, JSON.stringify(data, null, 2))

        if (!fs.existsSync(LOG_FILE)) {
            fs.writeFileSync(LOG_FILE, 'timestamp,city,temperature,description\n')
        }

        const logEntry = `${nowUTC},${city},${data.main.temp},${data.weather[0].description}\n`
        fs.appendFileSync(LOG_FILE, logEntry)

        console.log(`Weather data updated for ${city} at ${nowUTC}`)
    } catch(err) {
        //console.error(`Error fetching weather: ${err}`)
    }
}

fetchWeather();