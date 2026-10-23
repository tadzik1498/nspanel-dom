# Data formats

## Layout (stored in `sensor.nspanel_dom_uklad`, attribute `uklad`)
JSON list of tiles on a 24 x 16 grid (cell = 20 px of the 480x320 screen):

    {"t":"V","c":0,"r":0,"w":7,"h":8,"e":"sensor.temp","l":"Label","o1":"","o2":""}

| field | meaning |
|---|---|
| t | W weather+clock (o1=0 → weather only), C clock, V value, B value with bar, T switch, K climate. V with `o2:"g13"` = tariff tile, `o2:"dom"` = house tile |
| c, r, w, h | column, row, width, height in cells |
| e, l | entity id, label |
| o1, o2 | V: decimals, unit · B: bar min, max |

## Tariff tile (`g13_entity`) – semicolon string
`zone;until;saved_pct;kwh_P;kwh_A;kwh_B;segments;month_pln`
- zone: `P` cheap, `A` medium, `B` expensive · until: `HH:MM`
- segments: today's schedule, e.g. `P0A7P13B16P21` (zone letter + start hour)

## House tile (`dom_entity`) – semicolon string
`indoor_temp;outdoor_or_roof_temp;power_w;power_max_w`
