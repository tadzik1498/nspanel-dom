# Building the Nextion TFT (one-time, Nextion Editor on Windows)

The repository ships a compiled `display/nspanel_dom.tft`. To rebuild it yourself (or to add
glyphs for another language) you do not need an `.HMI` source – the project is intentionally
almost empty: all UI is drawn by the ESP with Nextion primitives.

1. New project, model **NX4832F035_011**, direction **Horizontal 0** (480x320).
2. *Tools > Font Generator*, encoding **iso-8859-2** (Latin-2: Polish, German, Czech, Hungarian...),
   add in this order:
   - font 0: 16 px
   - font 1: 24 px
   - font 2: 32 px
   - font 3: 56 px **bold** (Arial Bold – numbers in tiles)
   - font 4: 72 px **bold** (Arial Bold – clock and outdoor temperature)
3. `page0`: no components, `sta` = solid colour, `bco` = 2146.
4. `page0` > *Touch Press Event*:

       sys0=tch0/30
       sys1=tch1/20
       sys2=sys1*16
       sys2+=sys0
       printh 65 00
       prints sys2,1
       printh 01 ff ff ff

5. `page0` > *Touch Release Event*:

       printh 65 00 00 00 ff ff ff

6. *File > TFT file output* → `nspanel_dom.tft`; copy it to `/config/www/nspanel/nspanel_dom.tft`.
7. After flashing the firmware press **Upload TFT** in HA.

The touch grid is 16 columns x 16 rows (30 x 20 px); the cell number arrives as `component_id`
in the `on_touch` event.

**Languages and fonts:** iso-8859-2 covers Polish and German. Ukrainian (Cyrillic) needs a
different encoding (e.g. iso-8859-5) and a re-mapped string table in `esphome/nspanel_i18n.h`.
