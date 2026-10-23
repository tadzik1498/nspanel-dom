# Interactive weather background, time of day, alarms and chimes

## 1. Weather sky and time of day
Every tile that "sits on the sky" (weather, tariff, house) is painted with the same 16-band vertical gradient,
so the screen reads as one picture. The gradient depends on two inputs:

| Input | Source | Result |
|---|---|---|
| **Weather group** (8) | `weather.*` entity from the `ekran_glowny` block | palette: 0 clear/sunny, 1 partly cloudy, 2 cloudy, 3 fog, 4 rain/downpour/hail/sleet, 5 thunderstorm, 6 snow, 7 windy |
| **Time of day** (3) | `sun.sun` elevation, sent with the home-screen data | night < −4°, dusk/dawn −4°…6°, day ≥ 6° |

- Clear/partly-cloudy/windy skies change character: **day** = blue, **dusk/dawn** = deep blue to orange horizon,
  **night** = near-black blue. Overcast groups are simply darkened (×0.6 at dusk, ×0.3 at night).
- The weather tile draws a **sun** (day), a low **orange sun** (dusk) or a **moon** (night) for clear-ish skies,
  and clouds / rain / snow / lightning for the other groups.
- Tariff and house tiles take their band from the same gradient (the editor and the firmware use identical code), so
  they blend with the weather tile and change with the day automatically.
- The editor preview shows exactly this (it also follows real weather and sun in your HA).

### Interactive
Touching the weather tile opens the **forecast screen** (next 8 hours and 5 days: temperature, precipitation
probability and amount). Data come from `weather.get_forecasts` (hourly + daily) every 10 minutes.
Touching the climate or house tile opens **climate control** (mode, setpoint, fan, swing).

## 2. Day overview
- **Tariff tile (Polish G13):** the outer ring is a 24 h dial of today's zones (cheap / medium / expensive), 0/6/12/18
  digits, hour ticks and a "now" hand; the middle ring is savings vs G11, the inner ring kWh per zone.
- **Weather tile:** clock, condition, temperature, next-3 h precipitation, wind and humidity.
- **Forecast screen:** 8 h + 5 days (labels "Today / Tomorrow / weekday").

## 3. Alarms, messages and chimes – configuration
All of this lives on the panel's device page in HA (*Settings → Devices → ESPHome → NSPanel Dom → Configuration*).

### Hourly chime ("gong")
| Entity | Range / default | Meaning |
|---|---|---|
| Gong co godzinę (switch) | on/off | enables the chime |
| Gong od godziny | 0–23, default 8 | first hour of the chime window |
| Gong do godziny | 1–24, default 21 | end of the window (exclusive) |
| Melodia gongu | Krótki, Podwójny (default), Kuranty, Westminster | the melody played at minute 0 |
| Głośność pipczyka | 5–100 %, step 5, default 60 | buzzer volume |

The window may wrap past midnight (from 22 to 6 means 22:00–05:59). Outside the window the panel stays silent –
this is how you get a **quiet night**.

### Messages and alarms (`script.nspanel_dom_wiadomosc`)
Fields: title, text, **level** (0 Information – blue, 1 Warning – amber, 2 Alarm – red), **sound**
(`Brak`, `Krótki`, `Podwójny`, `Kuranty`, `Westminster`, `Ostrzeżenie`, `Alarm`), blink time, auto-close time, second button
and an identifier returned in the `esphome.nspanel_dom` event. Example automation (night alarm at 03:00 for a leak):

```yaml
- alias: Leak alarm on the panel
  triggers:
    - trigger: state
      entity_id: binary_sensor.leak
      to: "on"
  actions:
    - action: script.nspanel_dom_wiadomosc
      data:
        tytul: "Water leak"
        tresc: "Check the kitchen"
        poziom: 2
        dzwiek: "Alarm"
        mruganie: 30
```

### Reminder "light left on"
| Entity | Default | Meaning |
|---|---|---|
| Przypomnienie o świetle | switch | enables the reminder |
| Przypomnienie po | 5 min (1–240) | first reminder after the light has been on this long |
| Przypomnienie co | 5 min (1–120) | repeat interval |
| Przypomnienie poziom | Ostrzeżenie | level of the popup |
| Przypomnienie dźwięk | Podwójny | sound |
| Przypomnienie mruganie | 5 s | screen blink |
| Przypomnienie wyświetlaj | 60 s | how long the popup stays |
| Przypomnienie encje | text | comma-separated lights (empty = lights in an area/name containing "korytarz") |

### Hallway light window
`Korytarz: okno po włączeniu` (switch), `Korytarz: zgaś po` (10–3600 s, default 30), `Korytarz: okno widoczne` (3–120 s, default 10):
light on → beep + window "Turn off in N s"; tap → countdown with **Cancel** → light off; ignore → window disappears.

### Time-of-day tips
- Quiet nights: chime window 8–21 and a low buzzer volume.
- Dim screen: `Przyciemnienie po` (10–1800 s) and `Jasność przyciemniona` (0–100 %) – the screen dims after inactivity and the first touch only wakes it.
- Automations may pick the sound by time (e.g. `Alarm` at night, `Krótki` by day) because `dzwiek` is a plain field.

> Entity names are Polish because other parts of the project find them by name (see `TRANSLATING.md`).
