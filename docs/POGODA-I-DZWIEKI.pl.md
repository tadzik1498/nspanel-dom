# Interaktywne tło pogodowe, pory dnia, alarmy i gong – konfiguracja

## 1. Niebo zależne od pogody i pory dnia
Kafelki „na niebie" (pogoda, taryfa, domek) są malowane tym samym 16-pasmowym gradientem pionowym, więc ekran
wygląda jak jeden obraz. Gradient zależy od dwóch wejść:

| Wejście | Źródło | Efekt |
|---|---|---|
| **Grupa pogody** (8) | encja `weather.*` z bloku `ekran_glowny` | paleta: 0 słonecznie/pogodnie, 1 małe zachmurzenie, 2 pochmurno, 3 mgła, 4 deszcz/ulewa/grad/śnieg z deszczem, 5 burza, 6 śnieg, 7 wietrznie |
| **Pora dnia** (3) | wysokość słońca z `sun.sun`, wysyłana razem z danymi ekranu głównego | noc < −4°, świt/zmierzch −4°…6°, dzień ≥ 6° |

- Dla nieba pogodnego, z małym zachmurzeniem i wietrznego zmienia się charakter: **dzień** = błękit, **świt/zmierzch** =
  granat z pomarańczowym horyzontem, **noc** = prawie czarny granat. Grupy pochmurne są po prostu przyciemniane
  (×0,6 o zmierzchu, ×0,3 w nocy).
- Kafelek pogody rysuje **słońce** (dzień), niskie **pomarańczowe słońce** (zmierzch) albo **księżyc** (noc) przy
  pogodnym niebie oraz chmury / deszcz / śnieg / błyskawice dla pozostałych grup.
- Kafelki taryfy i domku biorą pasmo z tego samego gradientu (edytor i firmware używają identycznego kodu), więc
  łączą się z kafelkiem pogody i same zmieniają się w ciągu dnia.
- Podgląd w edytorze pokazuje dokładnie to samo (również podąża za prawdziwą pogodą i słońcem w Twoim HA).

### Interaktywność
Dotknięcie kafelka pogody otwiera **ekran prognozy** (najbliższe 8 godzin i 5 dni: temperatura, prawdopodobieństwo
i ilość opadów). Dane pochodzą z `weather.get_forecasts` (godzinowa + dzienna), odświeżane co 10 minut.
Dotknięcie klimatyzacji lub domku otwiera **sterowanie klimatyzacją** (tryb, nastawa, nawiew, ruch żaluzji).

## 2. Przegląd dnia
- **Kafelek taryfy (G13):** zewnętrzny pierścień to tarcza 24 h ze strefami na dziś (tania / średnia / droga), cyframi
  0/6/12/18, znacznikami godzin i wskazówką „teraz"; środkowy pierścień to oszczędność vs G11, wewnętrzny – kWh w strefach.
- **Kafelek pogody:** zegar, opis, temperatura, opady w najbliższych 3 h, wiatr i wilgotność.
- **Ekran prognozy:** 8 h + 5 dni (podpisy „Dziś / Jutro / dzień tygodnia").

## 3. Alarmy, wiadomości i gong – konfiguracja
Wszystko znajdziesz na stronie urządzenia panelu w HA (*Ustawienia → Urządzenia → ESPHome → NSPanel Dom → Konfiguracja*).

### Gong co godzinę
| Encja | Zakres / domyślnie | Znaczenie |
|---|---|---|
| Gong co godzinę (przełącznik) | wł./wył. | włącza gong |
| Gong od godziny | 0–23, domyślnie 8 | pierwsza godzina okna gongu |
| Gong do godziny | 1–24, domyślnie 21 | koniec okna (bez tej godziny) |
| Melodia gongu | Krótki, Podwójny (domyślnie), Kuranty, Westminster | melodia o pełnej godzinie |
| Głośność pipczyka | 5–100 %, krok 5, domyślnie 60 | głośność buzzera |

Okno może przechodzić przez północ (od 22 do 6 = 22:00–05:59). Poza oknem panel milczy – tak ustawisz **cichą noc**.

### Wiadomości i alarmy (`script.nspanel_dom_wiadomosc`)
Pola: tytuł, treść, **poziom** (0 Informacja – niebieski, 1 Ostrzeżenie – bursztynowy, 2 Alarm – czerwony), **dźwięk**
(`Brak`, `Krótki`, `Podwójny`, `Kuranty`, `Westminster`, `Ostrzeżenie`, `Alarm`), czas mrugania, czas automatycznego zamknięcia,
drugi przycisk i identyfikator zwracany w zdarzeniu `esphome.nspanel_dom`. Przykład – nocny alarm zalania:

```yaml
- alias: Alarm zalania na panelu
  triggers:
    - trigger: state
      entity_id: binary_sensor.zalanie
      to: "on"
  actions:
    - action: script.nspanel_dom_wiadomosc
      data:
        tytul: "Zalanie!"
        tresc: "Sprawdź kuchnię"
        poziom: 2
        dzwiek: "Alarm"
        mruganie: 30
```

### Przypomnienie „światło się pali"
| Encja | Domyślnie | Znaczenie |
|---|---|---|
| Przypomnienie o świetle | przełącznik | włącza przypomnienie |
| Przypomnienie po | 5 min (1–240) | pierwsze przypomnienie, gdy światło świeci tak długo |
| Przypomnienie co | 5 min (1–120) | odstęp powtórzeń |
| Przypomnienie poziom | Ostrzeżenie | poziom okna |
| Przypomnienie dźwięk | Podwójny | dźwięk |
| Przypomnienie mruganie | 5 s | mruganie ekranu |
| Przypomnienie wyświetlaj | 60 s | jak długo okno jest widoczne |
| Przypomnienie encje | tekst | światła po przecinku (puste = światła z pomieszczenia/nazwy zawierającej „korytarz") |

### Okno światła na korytarzu
`Korytarz: okno po włączeniu` (przełącznik), `Korytarz: zgaś po` (10–3600 s, domyślnie 30), `Korytarz: okno widoczne` (3–120 s, domyślnie 10):
światło włączone → pik + okno „Zgaś za N s"; dotknięcie → odliczanie z **Anuluj** → światło gaśnie; brak reakcji → okno znika.

### Wskazówki dotyczące pór dnia
- Cicha noc: okno gongu 8–21 i niska głośność buzzera.
- Przyciemnianie: `Przyciemnienie po` (10–1800 s) i `Jasność przyciemniona` (0–100 %) – ekran przyciemnia się po bezczynności,
  a pierwszy dotyk tylko go wybudza.
- Automatyzacje mogą dobierać dźwięk do pory (np. `Alarm` w nocy, `Krótki` w dzień), bo `dzwiek` to zwykłe pole.

> Nazwy encji są po polsku, bo inne części projektu wyszukują je po nazwie (patrz `TRANSLATING.md`).
