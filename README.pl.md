# NSPanel Dom – wizualny edytor ekranu dla Sonoff NSPanel (ESPHome + Nextion)

Edytor układu ekranu **przeciągnij i upuść** (karta Lovelace w czystym JS, bez budowania) dla fizycznego ekranu 480×320
Sonoff NSPanel z ESPHome. Układasz ekran główny w Home Assistant, klikasz **Zapisz na panel** i układ trafia na urządzenie –
bez edycji YAML i bez ponownego flashowania.

![demo](https://raw.githubusercontent.com/tadzik1498/nspanel-dom/main/docs/img/editor-demo.gif)

## Co potrafi
- podgląd siatki 24×16 prawdziwego ekranu z **żywymi wartościami** z HA
- przeciąganie, **zamiana miejscami** przez upuszczenie, zmiana rozmiaru z każdej krawędzi (sąsiedzi ustępują)
- kafelki: pogoda + zegar, wartość, wartość z paskiem, przełącznik, klimatyzacja, taryfa (G13), dom
- **interaktywne tło pogodowe** zależne od pogody i pory dnia, prognoza po dotknięciu – patrz [docs/POGODA-I-DZWIEKI.pl.md](docs/POGODA-I-DZWIEKI.pl.md)
- **alarmy, wiadomości i gong** z konfiguracją godzin, melodii i głośności – ten sam dokument
- podgląd używa **tego samego algorytmu dopasowania fontów co firmware**, więc co widzisz, to dostaniesz
- interfejs edytora po polsku, angielsku, niemiecku i ukraińsku; ekran panelu i teksty z HA po polsku/angielsku

## Dokumentacja
| Dokument | O czym |
|---|---|
| [docs/JAK-DZIALA.pl.md](docs/JAK-DZIALA.pl.md) | pełna mechanika: katalog, układ, dotyk, taryfa, wiadomości |
| [docs/POGODA-I-DZWIEKI.pl.md](docs/POGODA-I-DZWIEKI.pl.md) | tło pogodowe, pory dnia, alarmy, gong |
| [docs/HISTORIA.pl.md](docs/HISTORIA.pl.md) | historia projektu i decyzje projektowe |
| [docs/BUILD-TFT.md](docs/BUILD-TFT.md) | jak zbudować plik .tft (po angielsku) |
| [docs/TRANSLATING.md](docs/TRANSLATING.md) | jak dodać język (po angielsku) |
| [docs/DATA-FORMAT.md](docs/DATA-FORMAT.md) | format danych kafelków i układu |

## Instalacja (skrót)
1. Skopiuj `ha/nspanel_dom_ha.yaml` do `/config/packages/` (włącz `homeassistant: packages:`). Zmień encje `YOUR_*` na własne.
2. **HACS:** dodaj to repozytorium jako własne (kategoria *Dashboard*) i zainstaluj. Ręcznie: skopiuj `dist/nspanel-dom-editor.js` do
   `/config/www/` i dodaj jako zasób Lovelace (`/local/nspanel-dom-editor.js?v=1`, typ *module*).
3. Skopiuj `display/nspanel_dom.tft` do `/config/www/nspanel/`.
4. Skopiuj `esphome/secrets.yaml.example` jako `secrets.yaml`, uzupełnij (klucz API: `openssl rand -base64 32`), ustaw encje i
   `language: pl` lub `en` w `esphome/nspanel-dom.yaml` i wgraj firmware. Przeglądarkowy flasher (eksperymentalny): [flasher/](flasher/README.md).
5. Dodaj kartę: `type: custom:nspanel-dom-editor-card` (opcje: `language`, `g13_entity`, `dom_entity`, ...).

## Ograniczenia
- Nazwy encji tworzonych przez firmware (np. `Korytarz: zgaś po`), nazwy dźwięków i część komentarzy są po polsku (patrz `docs/TRANSLATING.md`).
- Tłumaczenie firmware sprawdzono pod kątem składni C++, ale nie skompilowano go na urządzeniu – zgłaszaj problemy.
- Kafelek taryfy dotyczy polskiej taryfy G13.

## Autor
Tadeusz ([@tadzik1498](https://github.com/tadzik1498)). Licencja MIT. English: [README.md](README.md).
