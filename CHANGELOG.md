# Changelog

## 1.14
- Tariff (G13) tile: the outer ring is now a 24 h dial with zones, hour ticks, 0/6/12/18 digits and a "now" hand (replaces the day bar)
- Editor card: multilingual UI (EN/PL/DE/UK), configurable entities (`g13_entity`, `dom_entity`, ...)
- Firmware: selectable on-screen language (`language: pl|en`), secrets moved to `!secret`
- HA package: `input_select.nspanel_dom_language` selects the language of generated texts

## 1.13
- Readability for seniors: tariff tile with a thick frame in the zone colour, large values, hour ticks on the day bar
- House tile: full house with a thick outline, two unified value sizes
- Hallway: switch-off after 30 s (default)

## 1.12
- Tariff and house tiles on a sky background consistent with the weather tile (bands by weather and time of day); transparent text with shadow like the weather tile

## 1.11
- "House" tile: roof temperature, indoor temperature, climate, power; touch = climate control

## 1.10
- "Tariff G13" tile (type V with option g13); Nextion command queue of 800; V tiles refresh every minute

## 1.9
- Countdown in the window (`{s}` in text); window when the hallway light turns on
