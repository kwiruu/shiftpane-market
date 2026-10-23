import type { Widget } from '@shiftpane/format'

export const weather: Widget = {
  id: 'weather',
  name: 'Weather',
  author: 'shiftpane',
  license: 'MIT',
  categories: ['weather'],
  minAppVersion: '0.6.0',
  sizes: ['small', 'medium', 'large'],
  refreshSeconds: 900,
  permissions: {
    sources: [],
    actions: [],
    local: [],
    network: ['api.open-meteo.com', 'geocoding-api.open-meteo.com'],
    secrets: [],
  },
  config: [
    {
      key: 'location',
      label: 'City',
      type: 'location',
      required: true,
    },
    {
      key: 'units',
      label: 'Temperature unit',
      type: 'select',
      options: [
        {
          value: 'celsius',
          label: 'Celsius',
        },
        {
          value: 'fahrenheit',
          label: 'Fahrenheit',
        },
      ],
      default: 'celsius',
    },
  ],
  summary: 'One large temperature, with your city and current conditions.',
  icon: 'sun',
  tone: 'dark',
  featured: true,
  createdAt: '2026-10-23',
  versions: [
    {
      version: '1.0.0',
      publishedAt: '2026-10-23',
      permissions: {
        sources: [],
        actions: [],
        local: [],
        network: ['api.open-meteo.com', 'geocoding-api.open-meteo.com'],
        secrets: [],
      },
      notes: 'First release. A large temperature with city and current conditions.',
    },
  ],
  view: {
    small: {
      type: 'stack',
      gap: 1,
      align: 'start',
      children: [
        {
          type: 'stack',
          gap: 2,
          align: 'start',
          children: [
            {
              type: 'stack',
              gap: 0.5,
              align: 'start',
              children: [
                {
                  type: 'text',
                  text: '{/city}',
                  size: 'md',
                  muted: false,
                },
                {
                  type: 'text',
                  text: '{/condition}',
                  size: 'xs',
                  muted: true,
                },
              ],
            },
            {
              type: 'value',
              bind: '/temperatureNumber',
              unit: '{/temperatureUnit}',
              size: 'hero',
            },
          ],
        },
      ],
      surface: 'blue',
    },
    medium: {
      type: 'stack',
      gap: 1,
      align: 'start',
      children: [
        {
          type: 'stack',
          gap: 2,
          align: 'start',
          children: [
            {
              type: 'stack',
              gap: 0.5,
              align: 'start',
              children: [
                {
                  type: 'text',
                  text: '{/city}',
                  size: 'md',
                  muted: false,
                },
                {
                  type: 'text',
                  text: '{/condition}',
                  size: 'xs',
                  muted: true,
                },
              ],
            },
            {
              type: 'value',
              bind: '/temperatureNumber',
              unit: '{/temperatureUnit}',
              size: 'hero',
            },
          ],
        },
      ],
      surface: 'blue',
    },
    large: {
      type: 'stack',
      gap: 1,
      align: 'start',
      children: [
        {
          type: 'stack',
          gap: 2,
          align: 'start',
          children: [
            {
              type: 'stack',
              gap: 0.5,
              align: 'start',
              children: [
                {
                  type: 'text',
                  text: '{/city}',
                  size: 'md',
                  muted: false,
                },
                {
                  type: 'text',
                  text: '{/condition}',
                  size: 'xs',
                  muted: true,
                },
              ],
            },
            {
              type: 'value',
              bind: '/temperatureNumber',
              unit: '{/temperatureUnit}',
              size: 'hero',
            },
          ],
        },
      ],
      surface: 'blue',
    },
  },
  sample: {
    location: 'Manila, Philippines',
    temperature: '29°C',
    feelsLike: '33°C',
    condition: 'Partly cloudy',
    icon: 'cloud-sun',
    rain: '30%',
    hours: [
      {
        time: '16:00',
        temperature: '29°C',
        rain: '30%',
      },
      {
        time: '17:00',
        temperature: '28°C',
        rain: '40%',
      },
      {
        time: '18:00',
        temperature: '27°C',
        rain: '50%',
      },
      {
        time: '19:00',
        temperature: '27°C',
        rain: '40%',
      },
      {
        time: '20:00',
        temperature: '26°C',
        rain: '20%',
      },
      {
        time: '21:00',
        temperature: '26°C',
        rain: '10%',
      },
    ],
    updated: '2026-10-23 07:30Z',
    attribution: 'Open-Meteo',
    city: 'Manila',
    temperatureNumber: '29',
    temperatureUnit: '°C',
    updatedShort: '07:30Z',
  },
  collector:
    // biome-ignore lint/suspicious/noTemplateCurlyInString: This string is the shipped collector source.
    "import { defineCollector } from '@shiftpane/widget-sdk'\n\nconst finite = (value) => typeof value === 'number' && Number.isFinite(value)\nconst temperature = (value, unit) => (finite(value) ? `${Math.round(value)}°${unit}` : '—')\nconst chance = (value) =>\n  finite(value) && value >= 0 && value <= 100 ? `${Math.round(value)}%` : '—'\n\nfunction condition(code, day) {\n  if (code === 0) return [day ? 'Clear sky' : 'Clear night', day ? 'sun' : 'moon']\n  if (code === 1 || code === 2) return ['Partly cloudy', day ? 'cloud-sun' : 'cloud-moon']\n  if (code === 3) return ['Overcast', 'cloud']\n  if (code === 45 || code === 48) return ['Fog', 'fog']\n  if ([51, 53, 55, 56, 57].includes(code)) return ['Drizzle', 'rain']\n  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ['Rain', 'rain']\n  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['Snow', 'snow']\n  if ([95, 96, 99].includes(code)) return ['Thunderstorm', 'storm']\n  return ['Conditions unavailable', 'cloud']\n}\n\nexport default defineCollector(async ({ config, fetch, signal }) => {\n  const location = JSON.parse(config.location)\n  if (\n    !finite(location.latitude) ||\n    Math.abs(location.latitude) > 90 ||\n    !finite(location.longitude) ||\n    Math.abs(location.longitude) > 180 ||\n    !location.timezone\n  ) {\n    throw new Error('Select a city in settings.')\n  }\n  const units = config.units === 'fahrenheit' ? 'fahrenheit' : 'celsius'\n  const unit = units === 'fahrenheit' ? 'F' : 'C'\n  // Local ISO timestamps come from the provider in the selected city's timezone. QuickJS\n  // deliberately needs no Intl implementation or access to the phone's timezone.\n  const url =\n    'https://api.open-meteo.com/v1/forecast' +\n    `?latitude=${location.latitude}&longitude=${location.longitude}` +\n    `&timezone=${encodeURIComponent(location.timezone)}&temperature_unit=${units}` +\n    '&current=temperature_2m,apparent_temperature,weather_code,is_day' +\n    '&hourly=temperature_2m,precipitation_probability&forecast_days=2'\n  const response = await fetch(url, { signal })\n  if (!response.ok) throw new Error(`Open-Meteo answered ${response.status}`)\n  const body = await response.json()\n  const current = body.current\n  const hourly = body.hourly\n  if (!current || typeof current.time !== 'string' || !hourly || !Array.isArray(hourly.time)) {\n    throw new Error('Open-Meteo returned an incomplete forecast.')\n  }\n  const [text, icon] = condition(current.weather_code, current.is_day !== 0)\n  const hour = current.time.slice(0, 13)\n  const currentIndex = hourly.time.findIndex(\n    (time) => typeof time === 'string' && time.slice(0, 13) === hour,\n  )\n  const upcoming = hourly.time\n    .flatMap((time, index) => {\n      if (typeof time !== 'string' || time <= current.time) return []\n      return [\n        {\n          time: time.slice(11, 16),\n          temperature: temperature(hourly.temperature_2m?.[index], unit),\n          rain: chance(hourly.precipitation_probability?.[index]),\n        },\n      ]\n    })\n    .slice(0, 6)\n  while (upcoming.length < 6) upcoming.push({ time: '—', temperature: '—', rain: '—' })\n  return {\n    location: location.label,\n    city: location.label.split(',')[0],\n    temperatureNumber: finite(current.temperature_2m)\n      ? String(Math.round(current.temperature_2m))\n      : '—',\n    temperatureUnit: `°${unit}`,\n    temperature: temperature(current.temperature_2m, unit),\n    feelsLike: temperature(current.apparent_temperature, unit),\n    condition: text,\n    icon,\n    rain: chance(hourly.precipitation_probability?.[currentIndex]),\n    hours: upcoming,\n    updated: `${new Date().toISOString().slice(0, 16).replace('T', ' ')}Z`,\n    updatedShort: `${new Date().toISOString().slice(11, 16)}Z`,\n    attribution: 'Open-Meteo',\n  }\n})\n",
  readme:
    '# Weather\n\nA large, simple temperature for a city you choose. Requires ShiftPane 0.6.0.\n\nSelect a city in widget settings, then choose Celsius (default) or Fahrenheit. Search results include region, country and timezone. There is no automatic location tracking.\n\nEvery size uses the same simple layout: city and conditions above one oversized temperature, with the unit raised beside it. The card uses a deep blue gradient with no footer. Missing readings display an em dash; failed refreshes keep the previous reading. Check widget settings for update status and errors.\n\nRefreshes every 15 minutes while displayed. Forecast requests go directly from your PC to api.open-meteo.com; city searches go to geocoding-api.open-meteo.com. No key is needed for personal, non-commercial use. The hosted free API has no uptime guarantee and is limited to 10,000 calls per day; commercial use requires a separate provider subscription and is not supported by this package.\n\nWeather data by [Open-Meteo](https://open-meteo.com/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [provider terms](https://open-meteo.com/en/terms), [pricing](https://open-meteo.com/en/pricing), [forecast documentation](https://open-meteo.com/en/docs) and [geocoding documentation](https://open-meteo.com/en/docs/geocoding-api).\n\nWidget code: MIT. One saved city per installed widget; repeated cards share its settings.\n',
}
