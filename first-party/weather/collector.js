import { defineCollector } from '@shiftpane/widget-sdk'

const finite = (value) => typeof value === 'number' && Number.isFinite(value)
const temperature = (value, unit) => (finite(value) ? `${Math.round(value)}°${unit}` : '—')
const chance = (value) =>
  finite(value) && value >= 0 && value <= 100 ? `${Math.round(value)}%` : '—'

function condition(code, day) {
  if (code === 0) return [day ? 'Clear sky' : 'Clear night', day ? 'sun' : 'moon']
  if (code === 1 || code === 2) return ['Partly cloudy', day ? 'cloud-sun' : 'cloud-moon']
  if (code === 3) return ['Overcast', 'cloud']
  if (code === 45 || code === 48) return ['Fog', 'fog']
  if ([51, 53, 55, 56, 57].includes(code)) return ['Drizzle', 'rain']
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ['Rain', 'rain']
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['Snow', 'snow']
  if ([95, 96, 99].includes(code)) return ['Thunderstorm', 'storm']
  return ['Conditions unavailable', 'cloud']
}

export default defineCollector(async ({ config, fetch, signal }) => {
  const location = JSON.parse(config.location)
  if (
    !finite(location.latitude) ||
    Math.abs(location.latitude) > 90 ||
    !finite(location.longitude) ||
    Math.abs(location.longitude) > 180 ||
    !location.timezone
  ) {
    throw new Error('Select a city in settings.')
  }
  const units = config.units === 'fahrenheit' ? 'fahrenheit' : 'celsius'
  const unit = units === 'fahrenheit' ? 'F' : 'C'
  // Local ISO timestamps come from the provider in the selected city's timezone. QuickJS
  // deliberately needs no Intl implementation or access to the phone's timezone.
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&timezone=${encodeURIComponent(location.timezone)}&temperature_unit=${units}` +
    '&current=temperature_2m,apparent_temperature,weather_code,is_day' +
    '&hourly=temperature_2m,precipitation_probability&forecast_days=2'
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Open-Meteo answered ${response.status}`)
  const body = await response.json()
  const current = body.current
  const hourly = body.hourly
  if (!current || typeof current.time !== 'string' || !hourly || !Array.isArray(hourly.time)) {
    throw new Error('Open-Meteo returned an incomplete forecast.')
  }
  const [text, icon] = condition(current.weather_code, current.is_day !== 0)
  const hour = current.time.slice(0, 13)
  const currentIndex = hourly.time.findIndex(
    (time) => typeof time === 'string' && time.slice(0, 13) === hour,
  )
  const upcoming = hourly.time
    .flatMap((time, index) => {
      if (typeof time !== 'string' || time <= current.time) return []
      return [
        {
          time: time.slice(11, 16),
          temperature: temperature(hourly.temperature_2m?.[index], unit),
          rain: chance(hourly.precipitation_probability?.[index]),
        },
      ]
    })
    .slice(0, 6)
  while (upcoming.length < 6) upcoming.push({ time: '—', temperature: '—', rain: '—' })
  return {
    location: location.label,
    city: location.label.split(',')[0],
    temperatureNumber: finite(current.temperature_2m)
      ? String(Math.round(current.temperature_2m))
      : '—',
    temperatureUnit: `°${unit}`,
    temperature: temperature(current.temperature_2m, unit),
    feelsLike: temperature(current.apparent_temperature, unit),
    condition: text,
    icon,
    rain: chance(hourly.precipitation_probability?.[currentIndex]),
    hours: upcoming,
    updated: `${new Date().toISOString().slice(0, 16).replace('T', ' ')}Z`,
    updatedShort: `${new Date().toISOString().slice(11, 16)}Z`,
    attribution: 'Open-Meteo',
  }
})
