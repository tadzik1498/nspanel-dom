# Project history

> Reconstructed from file modification dates and the version notes inside the files – dates are approximate.
> Written by the author's assistant (Claude Code) at publication time.

| When (2026) | Step |
|---|---|
| late Aug | First experiments with the Sonoff NSPanel and ESPHome: several throw-away configs (stock panel, demo, reset/mode tests). They were archived and are **not** part of this repository (they contained personal Wi-Fi data). |
| 28–29 Sep | Idea changes from "a fixed ESPHome screen" to a **dynamic panel**: Home Assistant discovers floors/areas/entities and sends a catalog to the panel; the Nextion TFT is reduced to an empty page + fonts + touch code, everything is drawn by the ESP. First `nspanel_dom_ha` package and firmware. |
| 29 Sep | Editor v1.7: drag & drop layout preview on a 24x16 grid with live values, "Save to panel". |
| 30 Sep | Editor v1.8–v1.9: swap by dropping on another tile, resize from every edge/corner (neighbours give way), adding a tile splits the largest one. Firmware/package v1.9: countdown windows, hallway-light reminder. |
| 7 Oct | Tariff (Polish G13) tile v1.10 and the Nextion command queue; "House" tile v1.11; sky background shared by weather/tariff/house tiles v1.12; senior-friendly readability v1.13; 24 h dial ring v1.14. Editor reaches v1.14 with preview identical to the firmware drawing code. |
| 23 Oct | Preparation for publication: secrets moved out, personal entities replaced by placeholders, editor UI translated (EN/PL/DE/UK), firmware/package texts translated (EN/PL), documentation, GitHub repository, HACS metadata, v1.14.0 release. |

## Design decisions (why it looks like this)
- **Nothing hard-coded in the firmware** → changing rooms, entities or layout never needs reflashing.
- **HA does the thinking, the ESP only draws.** Discovery, suggestions, forecasts and the layout live in a HA package; the panel receives compact text lines.
- **The editor preview uses the firmware's own algorithms** (font fitting, sky palette, tile geometry) so it is WYSIWYG.
- **Tiny Nextion project** (blank page, 5 fonts, touch code) → no proprietary HMI source to maintain; the recipe is in `docs/BUILD-TFT.md`.
