# Weather

A large, simple temperature for a city you choose. Requires ShiftPane 0.6.0.

Select a city in widget settings, then choose Celsius (default) or Fahrenheit. Search results include region, country and timezone. There is no automatic location tracking.

Every size uses the same simple layout: city and conditions above one oversized temperature, with the unit raised beside it. The card uses a deep blue gradient with no footer. Missing readings display an em dash; failed refreshes keep the previous reading. Check widget settings for update status and errors.

Refreshes every 15 minutes while displayed. Forecast requests go directly from your PC to api.open-meteo.com; city searches go to geocoding-api.open-meteo.com. No key is needed for personal, non-commercial use. The hosted free API has no uptime guarantee and is limited to 10,000 calls per day; commercial use requires a separate provider subscription and is not supported by this package.

Weather data by [Open-Meteo](https://open-meteo.com/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [provider terms](https://open-meteo.com/en/terms), [pricing](https://open-meteo.com/en/pricing), [forecast documentation](https://open-meteo.com/en/docs) and [geocoding documentation](https://open-meteo.com/en/docs/geocoding-api).

Widget code: MIT. One saved city per installed widget; repeated cards share its settings.
