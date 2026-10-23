# Historia projektu

> Odtworzona z dat modyfikacji plików i notatek wersji zapisanych w plikach – daty są przybliżone.
> Spisana przy publikacji przez asystenta autora (Claude Code).

| Kiedy (2026) | Etap |
|---|---|
| koniec sierpnia | Pierwsze próby z Sonoff NSPanel i ESPHome: kilka roboczych konfiguracji (panel fabryczny, demo, testy trybów i resetu). Zostały zarchiwizowane i **nie** wchodzą do tego repozytorium (zawierały prywatne dane Wi-Fi). |
| 28–29 września | Zmiana pomysłu: zamiast stałego ekranu w ESPHome – **panel dynamiczny**. Home Assistant sam wykrywa piętra, pomieszczenia i encje i wysyła katalog na panel. Plik TFT Nextiona sprowadzono do pustej strony z fontami i obsługą dotyku, a całe UI rysuje ESP. Pierwszy pakiet `nspanel_dom_ha` i firmware. |
| 29 września | Edytor v1.7: podgląd układu przeciągnij i upuść na siatce 24×16 z żywymi wartościami, „Zapisz na panel". |
| 30 września | Edytor v1.8–v1.9: zamiana kafelków przez upuszczenie, zmiana rozmiaru z każdej krawędzi (sąsiedzi ustępują), dodanie kafelka dzieli największy. Firmware i pakiet v1.9: okna z odliczaniem, przypomnienie o zapalonym świetle na korytarzu. |
| 7 października | Kafelek taryfy G13 v1.10 i kolejka poleceń Nextiona; kafelek „Dom" v1.11; wspólne tło nieba dla pogody, taryfy i domu v1.12; czytelność dla seniora v1.13; tarcza 24 h v1.14. Edytor v1.14 z podglądem identycznym z rysowaniem w firmware. |
| 23 października | Przygotowanie do publikacji: sekrety wyniesione, prywatne encje zamienione na wzorce, tłumaczenie edytora (EN/PL/DE/UK) i tekstów firmware/pakietu (EN/PL), dokumentacja, repozytorium GitHub, metadane HACS, wydanie v1.14.0. |

## Decyzje projektowe (dlaczego tak to wygląda)
- **Nic na sztywno w firmware** → zmiana pomieszczeń, encji czy układu nie wymaga ponownego flashowania.
- **HA myśli, ESP tylko rysuje.** Wykrywanie, podpowiedzi, prognoza i układ są w pakiecie HA; panel dostaje zwięzłe linie tekstu.
- **Podgląd w edytorze używa tych samych algorytmów co firmware** (dopasowanie fontu, paleta nieba, geometria kafelków), więc to, co widać, jest tym, co pokaże panel.
- **Malutki projekt Nextion** (pusta strona, 5 fontów, kod dotyku) → brak własnościowego źródła HMI do utrzymywania; przepis jest w `docs/BUILD-TFT.md`.
