/*
 * NSPanel Dom - visual screen layout editor (Lovelace custom card)
 * Author: Tadeusz (tadzik1498) - MIT license
 *
 * Card:  type: custom:nspanel-dom-editor-card
 * Config (all optional):
 *   language:       en | pl | de | uk   (default: Home Assistant UI language)
 *   g13_entity:     sensor with Polish G13 tariff data  (semicolon string, see docs/DATA-FORMAT.md)
 *   dom_entity:     sensor with the "house" tile data   (semicolon string, see docs/DATA-FORMAT.md)
 *   layout_entity:  default sensor.nspanel_dom_uklad
 *   catalog_entity: default sensor.nspanel_dom_katalog
 *   info_entity:    default sensor.nspanel_dom_pogoda_info
 *   save_script:    default script.nspanel_dom_zapisz_uklad
 *
 * 24 x 16 grid (20 px cells) preview of the 480x320 panel with live values from HA.
 * Drag / swap / resize tiles, then "Save to panel".
 * Preview fonts are chosen with the same algorithm as the firmware (f_fit).
 */

const VERSION = "1.14";
const GRID_C = 24, GRID_R = 16;
const TYPES = {
  W: { min: [6, 6], def: [10, 16] },
  P: { min: [5, 5], def: [10, 11] },
  C: { min: [4, 3], def: [8, 4] },
  V: { min: [3, 3], def: [7, 8] },
  B: { min: [4, 4], def: [7, 8] },
  T: { min: [3, 3], def: [6, 5] },
  K: { min: [5, 5], def: [7, 8] },
  G: { min: [6, 7], def: [14, 9] },
  D: { min: [6, 6], def: [14, 7] },
};
let CFG = {};
const ENT = {
  get g13() { return CFG.g13_entity || "sensor.nspanel_g13_data"; },
  get dom() { return CFG.dom_entity || "sensor.nspanel_house_data"; },
  get layout() { return CFG.layout_entity || "sensor.nspanel_dom_uklad"; },
  get catalog() { return CFG.catalog_entity || "sensor.nspanel_dom_katalog"; },
  get info() { return CFG.info_entity || "sensor.nspanel_dom_pogoda_info"; },
  get script() { return (CFG.save_script || "script.nspanel_dom_zapisz_uklad").replace(/^script\./, ""); },
};
const G13_RGB = { P: [67,160,71], A: [251,140,0], B: [229,57,53] };

/* ---------- i18n: add a language by adding one object here (keys must match "en") ---------- */
const TR = {
  en: {
    "type.W": "Weather + clock", "type.P": "Weather", "type.C": "Clock", "type.V": "Value", "type.B": "Value with bar",
    "type.T": "Switch", "type.K": "Climate", "type.G": "Tariff (G13)", "type.D": "House (climate + sensors)",
    "z.P": "Cheap", "z.A": "Medium", "z.B": "Expensive",
    "w.sunny": "Sunny", "w.clear-night": "Clear", "w.partlycloudy": "Partly cloudy", "w.cloudy": "Cloudy", "w.fog": "Fog",
    "w.rainy": "Rain", "w.pouring": "Downpour", "w.hail": "Hail", "w.snowy": "Snow", "w.snowy-rainy": "Sleet",
    "w.lightning": "Thunderstorm", "w.lightning-rainy": "Thunderstorm, rain", "w.windy": "Windy", "w.windy-variant": "Windy", "w.exceptional": "Weather alert",
    "h.off": "Off", "h.heat": "Heating", "h.cool": "Cooling", "h.auto": "Auto", "h.heat_cool": "Auto", "h.dry": "Dry", "h.fan_only": "Fan",
    "f.auto": "Auto", "f.quiet": "Quiet", "f.low": "Low", "f.medium_low": "Med-low", "f.medium": "Medium", "f.medium_high": "Med-high", "f.high": "High", "f.turbo": "Turbo",
    "on": "On", "off": "Off", "na": "n/a", "run": "Run", "pick_entity": "(pick an entity)",
    "title": "NSPanel Dom - main screen", "editor": "editor", "add": "+ Add", "del": "Delete", "default": "Default", "undo": "Undo changes", "save": "Save to panel",
    "confirm_default": "Replace the current layout with the default one?",
    "loaded_default": "Default layout loaded - save to send it to the panel.",
    "only_one_weather": "Only one weather tile is allowed - change the type of the existing one (Weather / Weather + clock).",
    "only_one_weather_short": "Only one weather tile is allowed.",
    "no_space": "No space - delete or shrink a tile.",
    "shrunk": "A neighbouring tile was shrunk to make room.",
    "saved": "Saved - the panel will refresh the main screen shortly.",
    "save_error": "Save error: {0} (is the nspanel_dom_ha package loaded?)",
    "swapped": "Tiles swapped.",
    "cant_swap": "These tiles cannot be swapped - one would be too small for its type.",
    "drop_on_one": "Drop the tile onto exactly one tile to swap them.",
    "unsaved": "Unsaved changes. ",
    "help": "<b>How to use</b><br>• Drag a tile to move it; dropping it on another tile swaps them.<br>• A selected tile has handles on edges and corners - stretching into a neighbour shrinks the neighbour.<br>• Adding a tile with no free space splits the largest tile in half.<br>• Click a tile to choose its entity, label and options.<br>• The preview shows the visible part of the screen - what you see here is what the panel shows.<br>• On the panel: touching weather = forecast, climate / house = climate control, switch = toggle, others = rooms.<br>• \"Save to panel\" sends the layout immediately; it survives HA restarts.",
    "weather_note": "Weather entity: <b>{0}</b> - change it in the ekran_glowny block of the HA package. Touching the tile on the panel opens the full forecast.",
    "unset": "(set in HA package)",
    "g13_hint": "<b>Tariff</b> tile: current zone and when it ends, donut chart (outer = savings vs G11, inner = usage by zone) and today's zone strip. Entity: <b>{0}</b>. Requires firmware v1.10+. Data format: docs/DATA-FORMAT.md.",
    "dom_hint": "<b>House</b> tile: outdoor temperature on the roof, indoor temperature inside, climate (setpoint, mode, fan) and a power bar as the floor. Entity: <b>{0}</b>. Touching it on the panel opens climate control. Requires firmware v1.11+. Data format: docs/DATA-FORMAT.md.",
    "type": "Type", "entity": "Entity", "label": "Label (empty = entity name)",
    "ph_climate": "empty = from config", "ph_entity": "start typing or pick",
    "o_dec": "Decimals (empty = auto)", "o_unit": "Unit (empty = from entity)", "o_min": "Bar minimum", "o_max": "Bar maximum",
    "pos": "Position: column {0}, row {1} · size {2} × {3} cells ({4} × {5} px)",
    "climate_short": "Climate", "climate": "Climate", "airflow": "Fan: ", "at_home": "Indoors", "until": "until ", "cheaper": "Saving ", "per_month": " /month",
    "cheap_x": "Cheap ", "med_x": "Medium ", "exp_x": "Expensive ",
    "card_name": "NSPanel Dom - screen editor", "card_desc": "Visual layout editor for the NSPanel Dom main screen",
    "dup": "Another editor file is loaded too - remove the old resource in Settings > Dashboards > Resources",
  },
  pl: {
    "type.W": "Pogoda + zegar", "type.P": "Pogoda", "type.C": "Zegar", "type.V": "Wartość", "type.B": "Wartość z paskiem",
    "type.T": "Przełącznik", "type.K": "Klimatyzacja", "type.G": "Taryfa (G13)", "type.D": "Dom (klima + czujniki)",
    "z.P": "Tani", "z.A": "Średni", "z.B": "Drogi",
    "w.sunny": "Słonecznie", "w.clear-night": "Pogodnie", "w.partlycloudy": "Małe zachmurzenie", "w.cloudy": "Pochmurno", "w.fog": "Mgła",
    "w.rainy": "Deszcz", "w.pouring": "Ulewa", "w.hail": "Grad", "w.snowy": "Śnieg", "w.snowy-rainy": "Śnieg z deszczem",
    "w.lightning": "Burza", "w.lightning-rainy": "Burza z deszczem", "w.windy": "Wietrznie", "w.windy-variant": "Wietrznie", "w.exceptional": "Uwaga - pogoda",
    "h.off": "Wył.", "h.heat": "Grzanie", "h.cool": "Chłodzenie", "h.auto": "Auto", "h.heat_cool": "Auto", "h.dry": "Osuszanie", "h.fan_only": "Wentylator",
    "f.auto": "Auto", "f.quiet": "Cichy", "f.low": "Niski", "f.medium_low": "Śr.-niski", "f.medium": "Średni", "f.medium_high": "Śr.-wys.", "f.high": "Wysoki", "f.turbo": "Turbo",
    "on": "Wł.", "off": "Wył.", "na": "n/d", "run": "Uruchom", "pick_entity": "(wybierz encję)",
    "title": "NSPanel Dom - ekran główny", "editor": "edytor", "add": "+ Dodaj", "del": "Usuń", "default": "Domyślny", "undo": "Cofnij zmiany", "save": "Zapisz na panel",
    "confirm_default": "Zastąpić bieżący układ domyślnym?",
    "loaded_default": "Wczytano układ domyślny - zapisz, aby wysłać na panel.",
    "only_one_weather": "Kafelek pogody może być tylko jeden - zmień typ istniejącego (Pogoda / Pogoda + zegar).",
    "only_one_weather_short": "Kafelek pogody może być tylko jeden.",
    "no_space": "Brak miejsca - usuń albo zmniejsz któryś kafelek.",
    "shrunk": "Zmniejszono sąsiedni kafelek, żeby zrobić miejsce.",
    "saved": "Zapisano - panel odświeży ekran główny za chwilę.",
    "save_error": "Błąd zapisu: {0} (czy pakiet nspanel_dom_ha jest wczytany?)",
    "swapped": "Zamieniono miejscami.",
    "cant_swap": "Tych kafelków nie da się zamienić - któryś byłby za mały dla swojego typu.",
    "drop_on_one": "Upuść kafelek na jeden kafelek, żeby je zamienić.",
    "unsaved": "Niezapisane zmiany. ",
    "help": "<b>Jak używać</b><br>• Przeciągnij kafelek, aby go przesunąć; upuszczony na inny kafelek zamienia się z nim miejscami.<br>• Zaznaczony kafelek ma uchwyty na krawędziach i w rogach - rozciąganie na sąsiada zmniejsza sąsiada.<br>• Dodanie kafelka bez wolnego miejsca dzieli największy kafelek na pół.<br>• Kliknij kafelek, aby wybrać encję, podpis i opcje.<br>• Podgląd pokazuje widoczną część ekranu - to, co tu widzisz, zobaczysz na panelu.<br>• Na panelu: dotknięcie pogody = prognoza, klimatyzacji i domku = sterowanie klimą, przełącznika = włącz/wyłącz, reszty = pomieszczenia.<br>• „Zapisz na panel” wysyła układ od razu; układ przetrwa restart HA.",
    "weather_note": "Encja pogody: <b>{0}</b> - zmienisz ją w bloku ekran_glowny pakietu HA. Dotknięcie kafelka na panelu otwiera pełną prognozę.",
    "unset": "(ustaw w pakiecie HA)",
    "g13_hint": "Kafelek <b>Taryfa</b>: aktualna strefa i do kiedy trwa, wykres kołowy (zewnętrzny = oszczędność vs G11, wewnętrzny = zużycie wg strefy) i pasek stref na dziś. Encja: <b>{0}</b>. Wymaga firmware v1.10+. Format danych: docs/DATA-FORMAT.md.",
    "dom_hint": "Kafelek <b>Dom</b>: na dachu temperatura zewnętrzna, w środku domku temperatura w domu, obok klimatyzacja (nastawa, tryb, nawiew), a podłoże domku to pasek mocy. Encja: <b>{0}</b>. Dotknięcie na panelu otwiera sterowanie klimatyzacją. Wymaga firmware v1.11+. Format danych: docs/DATA-FORMAT.md.",
    "type": "Typ", "entity": "Encja", "label": "Podpis (puste = nazwa encji)",
    "ph_climate": "puste = z konfiguracji", "ph_entity": "zacznij pisać lub wybierz",
    "o_dec": "Miejsca po przecinku (puste = auto)", "o_unit": "Jednostka (puste = z encji)", "o_min": "Minimum paska", "o_max": "Maksimum paska",
    "pos": "Pozycja: kolumna {0}, wiersz {1} · rozmiar {2} × {3} pól ({4} × {5} px)",
    "climate_short": "Klima", "climate": "Klimatyzacja", "airflow": "Nawiew: ", "at_home": "W domu", "until": "do ", "cheaper": "Taniej o ", "per_month": " zł/mies.",
    "cheap_x": "Tani ", "med_x": "Średni ", "exp_x": "Drogi ",
    "card_name": "NSPanel Dom - edytor ekranu", "card_desc": "Wizualne układanie kafelków ekranu głównego NSPanel Dom",
    "dup": "Załadowany jest też inny plik edytora - usuń stary zasób w Ustawienia > Pulpity > Zasoby",
  },
  de: {
    "type.W": "Wetter + Uhr", "type.P": "Wetter", "type.C": "Uhr", "type.V": "Wert", "type.B": "Wert mit Balken",
    "type.T": "Schalter", "type.K": "Klima", "type.G": "Tarif (G13)", "type.D": "Haus (Klima + Sensoren)",
    "z.P": "Günstig", "z.A": "Mittel", "z.B": "Teuer",
    "w.sunny": "Sonnig", "w.clear-night": "Klar", "w.partlycloudy": "Teils bewölkt", "w.cloudy": "Bewölkt", "w.fog": "Nebel",
    "w.rainy": "Regen", "w.pouring": "Starkregen", "w.hail": "Hagel", "w.snowy": "Schnee", "w.snowy-rainy": "Schneeregen",
    "w.lightning": "Gewitter", "w.lightning-rainy": "Gewitter mit Regen", "w.windy": "Windig", "w.windy-variant": "Windig", "w.exceptional": "Wetterwarnung",
    "h.off": "Aus", "h.heat": "Heizen", "h.cool": "Kühlen", "h.auto": "Auto", "h.heat_cool": "Auto", "h.dry": "Entfeuchten", "h.fan_only": "Lüfter",
    "f.auto": "Auto", "f.quiet": "Leise", "f.low": "Niedrig", "f.medium_low": "Mittel-nied.", "f.medium": "Mittel", "f.medium_high": "Mittel-hoch", "f.high": "Hoch", "f.turbo": "Turbo",
    "on": "An", "off": "Aus", "na": "k. A.", "run": "Starten", "pick_entity": "(Entität wählen)",
    "title": "NSPanel Dom - Hauptbildschirm", "editor": "Editor", "add": "+ Hinzufügen", "del": "Löschen", "default": "Standard", "undo": "Änderungen verwerfen", "save": "Auf Panel speichern",
    "confirm_default": "Aktuelles Layout durch das Standard-Layout ersetzen?",
    "loaded_default": "Standard-Layout geladen - speichern, um es an das Panel zu senden.",
    "only_one_weather": "Es ist nur eine Wetterkachel erlaubt - ändere den Typ der vorhandenen (Wetter / Wetter + Uhr).",
    "only_one_weather_short": "Es ist nur eine Wetterkachel erlaubt.",
    "no_space": "Kein Platz - Kachel löschen oder verkleinern.",
    "shrunk": "Eine Nachbarkachel wurde verkleinert, um Platz zu schaffen.",
    "saved": "Gespeichert - das Panel aktualisiert den Hauptbildschirm gleich.",
    "save_error": "Speicherfehler: {0} (ist das Paket nspanel_dom_ha geladen?)",
    "swapped": "Kacheln getauscht.",
    "cant_swap": "Diese Kacheln lassen sich nicht tauschen - eine wäre zu klein für ihren Typ.",
    "drop_on_one": "Kachel genau auf eine andere Kachel ziehen, um sie zu tauschen.",
    "unsaved": "Ungespeicherte Änderungen. ",
    "help": "<b>Bedienung</b><br>• Kachel ziehen zum Verschieben; auf eine andere Kachel fallen lassen tauscht beide.<br>• Eine gewählte Kachel hat Griffe an Kanten und Ecken - Ziehen in den Nachbarn verkleinert diesen.<br>• Beim Hinzufügen ohne freien Platz wird die größte Kachel halbiert.<br>• Kachel anklicken, um Entität, Beschriftung und Optionen zu wählen.<br>• Die Vorschau zeigt den sichtbaren Teil des Displays - was du hier siehst, zeigt das Panel.<br>• Am Panel: Wetter berühren = Vorhersage, Klima / Haus = Klimasteuerung, Schalter = umschalten, Rest = Räume.<br>• „Auf Panel speichern“ sendet das Layout sofort; es übersteht HA-Neustarts.",
    "weather_note": "Wetter-Entität: <b>{0}</b> - im Block ekran_glowny des HA-Pakets änderbar. Berühren der Kachel am Panel öffnet die volle Vorhersage.",
    "unset": "(im HA-Paket festlegen)",
    "g13_hint": "Kachel <b>Tarif</b>: aktuelle Zone und deren Ende, Ringdiagramm (außen = Ersparnis ggü. G11, innen = Verbrauch je Zone) und Zonenband für heute. Entität: <b>{0}</b>. Benötigt Firmware v1.10+. Datenformat: docs/DATA-FORMAT.md.",
    "dom_hint": "Kachel <b>Haus</b>: Außentemperatur auf dem Dach, Innentemperatur im Haus, daneben Klima (Soll, Modus, Lüfter), der Boden ist ein Leistungsbalken. Entität: <b>{0}</b>. Berühren am Panel öffnet die Klimasteuerung. Benötigt Firmware v1.11+. Datenformat: docs/DATA-FORMAT.md.",
    "type": "Typ", "entity": "Entität", "label": "Beschriftung (leer = Entitätsname)",
    "ph_climate": "leer = aus Konfiguration", "ph_entity": "tippen oder wählen",
    "o_dec": "Nachkommastellen (leer = auto)", "o_unit": "Einheit (leer = von Entität)", "o_min": "Balken-Minimum", "o_max": "Balken-Maximum",
    "pos": "Position: Spalte {0}, Zeile {1} · Größe {2} × {3} Felder ({4} × {5} px)",
    "climate_short": "Klima", "climate": "Klima", "airflow": "Lüfter: ", "at_home": "Im Haus", "until": "bis ", "cheaper": "Ersparnis ", "per_month": " /Monat",
    "cheap_x": "Günstig ", "med_x": "Mittel ", "exp_x": "Teuer ",
    "card_name": "NSPanel Dom - Bildschirm-Editor", "card_desc": "Visueller Layout-Editor für den NSPanel-Dom-Hauptbildschirm",
    "dup": "Es ist noch eine andere Editor-Datei geladen - alte Ressource unter Einstellungen > Dashboards > Ressourcen entfernen",
  },
  uk: {
    "type.W": "Погода + годинник", "type.P": "Погода", "type.C": "Годинник", "type.V": "Значення", "type.B": "Значення зі смугою",
    "type.T": "Перемикач", "type.K": "Клімат", "type.G": "Тариф (G13)", "type.D": "Дім (клімат + датчики)",
    "z.P": "Дешево", "z.A": "Середньо", "z.B": "Дорого",
    "w.sunny": "Сонячно", "w.clear-night": "Ясно", "w.partlycloudy": "Мінлива хмарність", "w.cloudy": "Хмарно", "w.fog": "Туман",
    "w.rainy": "Дощ", "w.pouring": "Злива", "w.hail": "Град", "w.snowy": "Сніг", "w.snowy-rainy": "Мокрий сніг",
    "w.lightning": "Гроза", "w.lightning-rainy": "Гроза з дощем", "w.windy": "Вітряно", "w.windy-variant": "Вітряно", "w.exceptional": "Попередження",
    "h.off": "Вимк.", "h.heat": "Обігрів", "h.cool": "Охолодж.", "h.auto": "Авто", "h.heat_cool": "Авто", "h.dry": "Осушення", "h.fan_only": "Вентилятор",
    "f.auto": "Авто", "f.quiet": "Тихо", "f.low": "Низька", "f.medium_low": "Нижче сер.", "f.medium": "Середня", "f.medium_high": "Вище сер.", "f.high": "Висока", "f.turbo": "Турбо",
    "on": "Увімк.", "off": "Вимк.", "na": "н/д", "run": "Запустити", "pick_entity": "(виберіть сутність)",
    "title": "NSPanel Dom - головний екран", "editor": "редактор", "add": "+ Додати", "del": "Видалити", "default": "Типовий", "undo": "Скасувати зміни", "save": "Зберегти на панель",
    "confirm_default": "Замінити поточне компонування типовим?",
    "loaded_default": "Завантажено типове компонування - збережіть, щоб надіслати на панель.",
    "only_one_weather": "Плитка погоди може бути лише одна - змініть тип наявної (Погода / Погода + годинник).",
    "only_one_weather_short": "Плитка погоди може бути лише одна.",
    "no_space": "Немає місця - видаліть або зменште плитку.",
    "shrunk": "Сусідню плитку зменшено, щоб звільнити місце.",
    "saved": "Збережено - панель незабаром оновить головний екран.",
    "save_error": "Помилка збереження: {0} (чи завантажено пакет nspanel_dom_ha?)",
    "swapped": "Плитки поміняно місцями.",
    "cant_swap": "Ці плитки не можна поміняти - одна була б замала для свого типу.",
    "drop_on_one": "Киньте плитку рівно на одну плитку, щоб поміняти їх.",
    "unsaved": "Незбережені зміни. ",
    "help": "<b>Як користуватися</b><br>• Перетягніть плитку, щоб перемістити; кинута на іншу плитку, вона міняється з нею місцями.<br>• Вибрана плитка має ручки на краях і кутах - розтягування на сусіда зменшує сусіда.<br>• Додавання плитки без вільного місця ділить найбільшу плитку навпіл.<br>• Клацніть плитку, щоб вибрати сутність, підпис і параметри.<br>• Попередній перегляд показує видиму частину екрана - те, що бачите тут, побачите на панелі.<br>• На панелі: дотик до погоди = прогноз, клімат / дім = керування кліматом, перемикач = вмик./вимк., решта = кімнати.<br>• «Зберегти на панель» надсилає компонування одразу; воно переживає перезапуск HA.",
    "weather_note": "Сутність погоди: <b>{0}</b> - змінюється в блоці ekran_glowny пакета HA. Дотик до плитки на панелі відкриває повний прогноз.",
    "unset": "(задайте в пакеті HA)",
    "g13_hint": "Плитка <b>Тариф</b>: поточна зона й до коли триває, кільцева діаграма (зовнішнє = економія проти G11, внутрішнє = споживання за зонами) та смуга зон на сьогодні. Сутність: <b>{0}</b>. Потрібна прошивка v1.10+. Формат даних: docs/DATA-FORMAT.md.",
    "dom_hint": "Плитка <b>Дім</b>: на даху зовнішня температура, всередині - температура вдома, поруч клімат (уставка, режим, вентилятор), а підлога - смуга потужності. Сутність: <b>{0}</b>. Дотик на панелі відкриває керування кліматом. Потрібна прошивка v1.11+. Формат даних: docs/DATA-FORMAT.md.",
    "type": "Тип", "entity": "Сутність", "label": "Підпис (порожньо = назва сутності)",
    "ph_climate": "порожньо = з конфігурації", "ph_entity": "почніть вводити або виберіть",
    "o_dec": "Знаків після коми (порожньо = авто)", "o_unit": "Одиниця (порожньо = із сутності)", "o_min": "Мінімум смуги", "o_max": "Максимум смуги",
    "pos": "Позиція: стовпець {0}, рядок {1} · розмір {2} × {3} клітинок ({4} × {5} px)",
    "climate_short": "Клімат", "climate": "Клімат", "airflow": "Вентилятор: ", "at_home": "Вдома", "until": "до ", "cheaper": "Економія ", "per_month": " /міс.",
    "cheap_x": "Дешево ", "med_x": "Середньо ", "exp_x": "Дорого ",
    "card_name": "NSPanel Dom - редактор екрана", "card_desc": "Візуальний редактор компонування головного екрана NSPanel Dom",
    "dup": "Завантажено ще один файл редактора - видаліть старий ресурс у Налаштування > Панелі > Ресурси",
  },
};
let LANG = "en";
function T(key, ...a) {
  let v = (TR[LANG] && TR[LANG][key]) ?? TR.en[key] ?? key;
  a.forEach((x, i) => { v = v.replace("{" + i + "}", x); });
  return v;
}
const tr = (prefix, k) => { const key = prefix + "." + k; return (TR[LANG] && TR[LANG][key]) ?? TR.en[key] ?? k; };
const HVAC_COL = { heat: "#ff6e3c", cool: "#4696ff", auto: "#2ec4a0", heat_cool: "#2ec4a0", dry: "#c8a0ff", fan_only: "#b4cdd7" };
const FH = [16, 24, 32, 56, 72];

/* sky palette and tile styling ported from firmware (f_sky, f_sbg, f_tbg, f_acc, f_heat) */
const SKY_TOP = [[30,100,190],[50,105,170],[80,92,110],[105,110,118],[45,55,72],[28,26,45],[90,105,125],[55,110,170]];
const SKY_BOT = [[90,155,215],[110,150,195],[125,135,150],[150,155,160],[85,95,110],[65,58,80],[145,155,170],[115,155,190]];
function wgrp(w) {
  if (w === "partlycloudy") return 1;
  if (w === "cloudy") return 2;
  if (w === "fog") return 3;
  if (["rainy", "pouring", "hail", "snowy-rainy"].includes(w)) return 4;
  if (["lightning", "lightning-rainy"].includes(w)) return 5;
  if (w === "snowy") return 6;
  if (["windy", "windy-variant"].includes(w)) return 7;
  return 0;
}
function sky(band, g, t) {
  const clear = g === 0 || g === 1 || g === 7;
  let a = SKY_TOP[g].slice(), b = SKY_BOT[g].slice();
  if (t === 1) { if (clear) { a = [40,45,100]; b = [215,115,70]; } else { a = a.map((v) => v * 0.6); b = b.map((v) => v * 0.6); } }
  else if (t === 0) { if (clear) { a = [4,8,26]; b = [22,32,66]; } else { a = a.map((v) => v * 0.3); b = b.map((v) => v * 0.3); } }
  const f = band / 15;
  return a.map((v, k) => v + (b[k] - v) * f);
}
const mix = (c1, c2, t) => c1.map((v, k) => v + (c2[k] - v) * t);
const css = (c) => `rgb(${c.map((v) => Math.round(Math.max(0, Math.min(255, v)))).join(",")})`;
function heat(p) {
  p = Math.max(0, Math.min(1, p));
  if (p < 0.5) { const q = p / 0.5; return [60 + 180 * q, 200, 90 - 50 * q]; }
  const q = (p - 0.5) / 0.5; return [240 - 5 * q, 200 - 140 * q, 40 + 10 * q];
}
const HVAC_RGB = { heat: [255,110,60], cool: [70,150,255], auto: [46,196,160], heat_cool: [46,196,160], dry: [200,160,255], fan_only: [180,205,215] };

/* same metrics as firmware f_fit: Arial advance widths in em, fonts 0-2 regular, 3-4 bold */
function fitFont(t, maxw, maxh, maxf) {
  for (let f = maxf; f > 0; f--) {
    if (FH[f] > maxh) continue;
    const bold = f >= 3;
    let em = 0;
    for (const ch of String(t)) {
      let k;
      if (ch >= "0" && ch <= "9") k = 0.556;
      else if (".,; ".includes(ch)) k = 0.278;
      else if (ch === ":") k = bold ? 0.333 : 0.278;
      else if (ch === "°") k = 0.4;
      else if (ch === "-") k = 0.333;
      else if (ch === "%") k = 0.889;
      else if ("iljI|!'".includes(ch)) k = bold ? 0.278 : 0.222;
      else if ("tfr".includes(ch)) k = bold ? 0.36 : 0.3;
      else if (ch === "m") k = bold ? 0.889 : 0.833;
      else if (ch === "w") k = bold ? 0.778 : 0.722;
      else if (ch === "M") k = 0.833;
      else if (ch === "W") k = 0.944;
      else if (ch >= "a" && ch <= "z") k = bold ? 0.6 : 0.54;
      else if (ch >= "A" && ch <= "Z") k = bold ? 0.72 : 0.68;
      else k = bold ? 0.6 : 0.56;
      em += k;
    }
    if (em * FH[f] * 0.87 <= maxw) return f;
  }
  return 0;
}

class NSPanelDomEditorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tiles = null;
    this._sel = -1;
    this._drag = null;
    this._dirty = false;
    this._msg = "";
    this._tick = setInterval(() => this._renderCanvas(), 30000);
  }

  setConfig(config) { this._config = config || {}; CFG = this._config; if (CFG.language) LANG = String(CFG.language).slice(0, 2); }
  static getStubConfig() { return {}; }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: "full", rows: "auto", min_columns: 12 }; }
  disconnectedCallback() { clearInterval(this._tick); }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (!CFG.language) LANG = String(hass.language || "en").slice(0, 2);
    if (!TR[LANG]) LANG = "en";
    if (this._tiles === null && this._stored() !== null) this._load();
    if (first) this._build();
    if (!this._drag) this._renderCanvas();
  }

  /* ---------- data ---------- */
  _stored() {
    const h = this._hass;
    if (!h) return null;
    const u = h.states[ENT.layout]?.attributes?.uklad;
    if (Array.isArray(u) && u.length) return u;
    const d = h.states[ENT.catalog]?.attributes?.uklad_domyslny;
    if (Array.isArray(d) && d.length) return d;
    return [];
  }
  _glowny() { return this._hass?.states[ENT.catalog]?.attributes?.glowny || {}; }
  _load(fromDefault) {
    let src = fromDefault
      ? (this._hass.states[ENT.catalog]?.attributes?.uklad_domyslny || [])
      : this._stored() || [];
    this._tiles = JSON.parse(JSON.stringify(src)).map((t) => ({
      t: t.t === "W" && String(t.o1) === "0" ? "P" : (t.t === "V" && String(t.o2) === "g13" ? "G" : (t.t === "V" && String(t.o2) === "dom" ? "D" : t.t)), c: +t.c, r: +t.r, w: +t.w, h: +t.h,
      e: t.e || "", l: t.l || "", o1: t.o1 ?? "", o2: t.t === "V" && ["g13", "dom"].includes(String(t.o2)) ? "" : (t.o2 ?? ""),
    }));
    this._sel = -1;
    this._dirty = !!fromDefault;
    this._msg = fromDefault ? T("loaded_default") : "";
  }
  _visibleWidth() {
    const h = this._hass;
    const id = Object.keys(h.states).find((k) => k.startsWith("number.") && k.includes("widoczna_szerokosc"));
    const v = id ? parseFloat(h.states[id].state) : NaN;
    return isNaN(v) ? 456 : v;
  }

  /* ---------- layout helpers ---------- */
  _overlaps(t, skip) {
    return this._tiles.some((o, i) => i !== skip &&
      t.c < o.c + o.w && o.c < t.c + t.w && t.r < o.r + o.h && o.r < t.r + t.h);
  }
  _freeSpot(w, h) {
    for (let r = 0; r + h <= GRID_R; r++)
      for (let c = 0; c + w <= GRID_C; c++)
        if (!this._overlaps({ c, r, w, h }, -1)) return { c, r };
    return null;
  }

  /* ---------- UI skeleton ---------- */
  _build() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; }
        ha-card { padding:12px; }
        .bar { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:10px; }
        .bar .title { font-weight:600; font-size:16px; margin-right:auto; }
        button, select, input { font:inherit; font-size:14px; border-radius:8px; border:1px solid var(--divider-color,#555);
          background:var(--card-background-color,#222); color:var(--primary-text-color,#eee); padding:6px 10px; }
        button { cursor:pointer; }
        button.primary { background:var(--primary-color,#03a9f4); color:#fff; border-color:transparent; }
        button:disabled { opacity:.45; cursor:default; }
        .wrap { display:flex; flex-wrap:wrap; gap:12px; }
        .canvasbox { flex:1 1 480px; min-width:280px; }
        #cv { position:relative; width:100%; aspect-ratio:var(--vw,456)/320; background:#0c0e14; border-radius:6px; overflow:hidden;
          container-type:inline-size; touch-action:none; user-select:none; font-family:Arial,Helvetica,sans-serif; }
        .grid { position:absolute; inset:0; pointer-events:none;
          background-image:linear-gradient(to right,rgba(255,255,255,.05) 1px,transparent 1px),
                           linear-gradient(to bottom,rgba(255,255,255,.05) 1px,transparent 1px);
          background-size:calc(100%/24) calc(100%/16); }
        .tile { position:absolute; box-sizing:border-box; padding:0.42cqw; cursor:grab; }
        .tile .in { position:relative; width:100%; height:100%; overflow:hidden; background:#282c38; color:#e8eaf0; }
        .tile.sel .in { outline:0.6cqw solid var(--primary-color,#03a9f4); outline-offset:-0.3cqw; }
        .tile.bad .in { outline:0.6cqw solid #e44; outline-offset:-0.3cqw; }
        .tile .h { position:absolute; z-index:4; display:none; }
        .tile.sel .h { display:block; }
        .tile .h::after { content:""; position:absolute; background:var(--primary-color,#03a9f4); border-radius:2px; }
        .h.e, .h.w { top:18%; bottom:18%; width:4cqw; cursor:ew-resize; }
        .h.e { right:-1cqw; } .h.w { left:-1cqw; }
        .h.e::after, .h.w::after { left:1.5cqw; width:1cqw; top:25%; bottom:25%; }
        .h.n, .h.s { left:18%; right:18%; height:4cqw; cursor:ns-resize; }
        .h.n { top:-1cqw; } .h.s { bottom:-1cqw; }
        .h.n::after, .h.s::after { top:1.5cqw; height:1cqw; left:25%; right:25%; }
        .h.ne, .h.nw, .h.se, .h.sw { width:5cqw; height:5cqw; }
        .h.ne::after, .h.nw::after, .h.se::after, .h.sw::after { width:2cqw; height:2cqw; left:1.5cqw; top:1.5cqw; border-radius:50%; }
        .h.ne { top:-1.5cqw; right:-1.5cqw; cursor:nesw-resize; } .h.sw { bottom:-1.5cqw; left:-1.5cqw; cursor:nesw-resize; }
        .h.nw { top:-1.5cqw; left:-1.5cqw; cursor:nwse-resize; } .h.se { bottom:-1.5cqw; right:-1.5cqw; cursor:nwse-resize; }
        .tile.drag { opacity:.75; z-index:6; }
        .tile.swap .in { outline:0.7cqw dashed var(--primary-color,#03a9f4); outline-offset:-0.35cqw; filter:brightness(1.25); }
        .ver { font-size:12px; font-weight:400; color:var(--secondary-text-color,#aaa); margin-left:6px; }
        .lbl { position:absolute; left:1.7cqw; top:1.25cqw; color:#8c92a0; white-space:nowrap; }
        .val { position:absolute; left:0; right:0; display:flex; align-items:center; justify-content:center; font-weight:bold; white-space:nowrap; overflow:hidden; }
        .barbg { position:absolute; }
        .barfg { height:100%; background:linear-gradient(to right,#3cc85a,#f0c828 50%,#eb3c32); background-size:var(--full) 100%; }
        .shadow { text-shadow:0.4cqw 0.4cqw 0 #000; }
        .side { flex:1 1 240px; min-width:220px; display:flex; flex-direction:column; gap:8px; }
        .side label { font-size:12px; color:var(--secondary-text-color,#aaa); display:flex; flex-direction:column; gap:3px; }
        .side input, .side select { width:100%; box-sizing:border-box; }
        .hint { font-size:12px; color:var(--secondary-text-color,#aaa); line-height:1.4; }
        .msg { font-size:13px; margin-top:8px; color:var(--primary-color,#03a9f4); min-height:18px; }
        .dirty { color:#ffb020; font-size:13px; }
      </style>
      <ha-card>
        <div class="bar">
          <span class="title">${T("title")}<span class="ver">${T("editor")} v${VERSION}</span></span>
          <select id="addType">${Object.keys(TYPES).map((k) => `<option value="${k}">${T("type." + k)}</option>`).join("")}</select>
          <button id="add">${T("add")}</button>
          <button id="del">${T("del")}</button>
          <button id="dflt">${T("default")}</button>
          <button id="undo">${T("undo")}</button>
          <button id="save" class="primary">${T("save")}</button>
        </div>
        <div class="wrap">
          <div class="canvasbox"><div id="cv"></div><div class="msg" id="msg"></div></div>
          <div class="side" id="side"></div>
        </div>
      </ha-card>`;
    const $ = (id) => this.shadowRoot.getElementById(id);
    $("add").onclick = () => this._add($("addType").value);
    $("del").onclick = () => { if (this._sel >= 0) { this._tiles.splice(this._sel, 1); this._sel = -1; this._changed(); } };
    $("dflt").onclick = () => { if (confirm(T("confirm_default"))) { this._load(true); this._renderAll(); } };
    $("undo").onclick = () => { this._load(false); this._renderAll(); };
    $("save").onclick = () => this._save();
    const cv = $("cv");
    cv.addEventListener("pointerdown", (ev) => this._down(ev));
    cv.addEventListener("pointermove", (ev) => this._move(ev));
    cv.addEventListener("pointerup", (ev) => this._up(ev));
    cv.addEventListener("pointercancel", (ev) => this._up(ev));
    this._renderAll();
  }

  _changed() { this._dirty = true; this._msg = ""; this._renderAll(); }

  _add(type) {
    if (!this._tiles) this._tiles = [];
    if ((type === "W" || type === "P") && this._tiles.some((t) => t.t === "W" || t.t === "P")) {
      this._msg = T("only_one_weather");
      this._renderAll();
      return;
    }
    const T = TYPES[type];
    let w = T.def[0], h = T.def[1];
    let spot = this._freeSpot(w, h);
    if (!spot) { w = T.min[0]; h = T.min[1]; spot = this._freeSpot(w, h); }
    let msg = "";
    if (!spot) {
      /* no free space: split the largest tile that can give up half of its area */
      const order = this._tiles.map((t, i) => i).sort((a, b) => this._tiles[b].w * this._tiles[b].h - this._tiles[a].w * this._tiles[a].h);
      for (const i of order) {
        const o = this._tiles[i], m = TYPES[o.t].min;
        const horiz = o.w >= o.h * 1.2 || o.h - T.min[1] < m[1];
        if (horiz) {
          const nw = Math.max(T.min[0], Math.floor(o.w / 2));
          if (o.w - nw >= m[0] && o.h >= T.min[1]) { o.w -= nw; spot = { c: o.c + o.w, r: o.r }; w = nw; h = o.h; break; }
        }
        const nh = Math.max(T.min[1], Math.floor(o.h / 2));
        if (o.h - nh >= m[1] && o.w >= T.min[0]) { o.h -= nh; spot = { c: o.c, r: o.r + o.h }; w = o.w; h = nh; break; }
        const nw = Math.max(T.min[0], Math.floor(o.w / 2));
        if (o.w - nw >= m[0] && o.h >= T.min[1]) { o.w -= nw; spot = { c: o.c + o.w, r: o.r }; w = nw; h = o.h; break; }
      }
      if (!spot) { this._msg = T("no_space"); this._renderAll(); return; }
      msg = T("shrunk");
    }
    const g = this._glowny();
    const e = type === "K" ? (g.klima || "") : (type === "G" ? ENT.g13 : (type === "D" ? ENT.dom : ""));
    this._tiles.push({ t: type, c: spot.c, r: spot.r, w, h, e, l: "", o1: type === "B" ? 0 : "", o2: type === "B" ? 100 : "" });
    this._sel = this._tiles.length - 1;
    this._changed();
    this._msg = msg;
    this._renderAll();
  }

  async _save() {
    if (!this._tiles) return;
    const uklad = this._tiles.map((t) => {
      const o = { t: t.t === "P" ? "W" : t.t, c: t.c, r: t.r, w: t.w, h: t.h };
      if (t.t === "P") { o.o1 = 0; return o; }
      if (t.t === "G") { o.t = "V"; o.e = t.e || ENT.g13; o.o2 = "g13"; if (t.l) o.l = t.l; return o; }
      if (t.t === "D") { o.t = "V"; o.e = t.e || ENT.dom; o.o2 = "dom"; if (t.l) o.l = t.l; return o; }
      if (t.e) o.e = t.e;
      if (t.l) o.l = t.l;
      if (t.o1 !== "" && t.o1 !== null && t.o1 !== undefined) o.o1 = t.o1;
      if (t.o2 !== "" && t.o2 !== null && t.o2 !== undefined) o.o2 = t.o2;
      return o;
    });
    try {
      await this._hass.callService("script", ENT.script, { uklad });
      this._dirty = false;
      this._msg = T("saved");
    } catch (e) {
      this._msg = T("save_error", e.message || e);
    }
    this._renderAll();
  }

  /* ---------- pointer: move (swap on drop) / resize from any edge (neighbours shrink) ---------- */
  _cell(ev) {
    const r = this.shadowRoot.getElementById("cv").getBoundingClientRect();
    return { x: (ev.clientX - r.left) / (r.width / GRID_C), y: (ev.clientY - r.top) / (r.height / GRID_R) };
  }
  _down(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.classList && n.classList.contains("tile"));
    if (!el) { this._sel = -1; this._renderAll(); return; }
    const i = +el.dataset.i;
    const hEl = path.find((n) => n.classList && n.classList.contains("h"));
    const handle = hEl && this._sel === i ? hEl.dataset.h : "";
    this._sel = i;
    this._drag = { i, handle, p: this._cell(ev), snap: JSON.parse(JSON.stringify(this._tiles)), moved: false, swap: -1 };
    ev.target.setPointerCapture?.(ev.pointerId);
    this._renderAll();
    ev.preventDefault();
  }
  _hit(a, b) { return a.c < b.c + b.w && b.c < a.c + a.w && a.r < b.r + b.h && b.r < a.r + a.h; }
  _move(ev) {
    const d = this._drag;
    if (!d) return;
    const p = this._cell(ev);
    const dc = Math.round(p.x - d.p.x), dr = Math.round(p.y - d.p.y);
    if (!dc && !dr && !d.moved) return;
    d.moved = true;
    const o = d.snap[d.i], m = TYPES[o.t].min;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    if (!d.handle) {
      /* move: follow the pointer, remember the tile under it as a swap target */
      const t = this._tiles[d.i];
      t.c = clamp(o.c + dc, 0, GRID_C - o.w); t.r = clamp(o.r + dr, 0, GRID_R - o.h);
      const hits = d.snap.map((x, j) => j).filter((j) => j !== d.i && this._hit(t, d.snap[j]));
      d.swap = hits.length === 1 ? hits[0] : (hits.length ? -2 : -1);
      this._renderCanvas();
      return;
    }
    /* resize from the grabbed edge / corner */
    let { c, r, w, h } = o;
    const hd = d.handle;
    if (hd.includes("e")) w = clamp(o.w + dc, m[0], GRID_C - o.c);
    if (hd.includes("s")) h = clamp(o.h + dr, m[1], GRID_R - o.r);
    if (hd.includes("w")) { const nc = clamp(o.c + dc, 0, o.c + o.w - m[0]); w = o.w + (o.c - nc); c = nc; }
    if (hd.includes("n")) { const nr = clamp(o.r + dr, 0, o.r + o.h - m[1]); h = o.h + (o.r - nr); r = nr; }
    const next = JSON.parse(JSON.stringify(d.snap));
    const a = next[d.i];
    Object.assign(a, { c, r, w, h });
    /* neighbours on the side we grow into give way (shrink from that side) */
    let ok = true;
    for (let j = 0; j < next.length && ok; j++) {
      if (j === d.i || !this._hit(a, next[j])) continue;
      const b = next[j], bm = TYPES[b.t].min;
      if (b.c >= o.c + o.w) { const right = b.c + b.w; b.c = a.c + a.w; b.w = right - b.c; }
      else if (b.c + b.w <= o.c) { b.w = a.c - b.c; }
      else if (b.r >= o.r + o.h) { const bottom = b.r + b.h; b.r = a.r + a.h; b.h = bottom - b.r; }
      else if (b.r + b.h <= o.r) { b.h = a.r - b.r; }
      else ok = false;
      if (b.w < bm[0] || b.h < bm[1]) ok = false;
    }
    if (ok) for (let x = 0; x < next.length && ok; x++) for (let y = x + 1; y < next.length && ok; y++) if (this._hit(next[x], next[y])) ok = false;
    if (ok) { this._tiles = next; this._renderCanvas(); }
  }
  _up() {
    const d = this._drag;
    if (!d) return;
    this._drag = null;
    if (!d.moved) { this._renderAll(); return; }
    if (!d.handle) {
      const t = this._tiles[d.i];
      if (d.swap === -1) { this._msg = ""; this._changed(); return; }
      const A = d.snap[d.i], B = d.snap[d.swap];
      if (d.swap >= 0) {
        /* swap places: each tile takes over the other one's rectangle */
        const ma = TYPES[A.t].min, mb = TYPES[B.t].min;
        const next = JSON.parse(JSON.stringify(d.snap));
        if (B.w >= ma[0] && B.h >= ma[1] && A.w >= mb[0] && A.h >= mb[1]) {
          Object.assign(next[d.i], { c: B.c, r: B.r, w: B.w, h: B.h });
          Object.assign(next[d.swap], { c: A.c, r: A.r, w: A.w, h: A.h });
          this._tiles = next;
          this._changed();
          this._msg = T("swapped");
          this._renderAll();
          return;
        }
        this._msg = T("cant_swap");
      } else {
        this._msg = T("drop_on_one");
      }
      this._tiles = d.snap;
      this._renderAll();
      return;
    }
    this._changed();
  }

  /* ---------- rendering ---------- */
  _renderAll() {
    if (!this.shadowRoot.getElementById("cv")) return;
    this._renderCanvas();
    this._renderSide();
    const $ = (id) => this.shadowRoot.getElementById(id);
    $("msg").innerHTML = (this._dirty ? `<span class="dirty">● ${T("unsaved")}</span>` : "") + (this._msg || "");
    $("del").disabled = this._sel < 0;
  }

  _fmtVal(t) {
    const h = this._hass, s = h.states[t.e];
    if (!s) return { lbl: t.l || T("pick_entity"), val: "--", frac: 0 };
    let unit = t.t === "V" && t.o2 !== "" ? String(t.o2) : (s.attributes.unit_of_measurement || "");
    const st = s.state;
    let val, frac = 0;
    const v = parseFloat(st);
    if (st === "" || isNaN(v) || String(+st) !== String(v) && !/^-?\d+(\.\d+)?$/.test(st)) {
      val = ["unavailable", "unknown"].includes(st) ? "--" : st === "on" ? T("on") : st === "off" ? T("off") : tr("h", st);
    } else {
      let x = v;
      if (t.t === "B") {
        const mn = t.o1 === "" ? 0 : +t.o1, mx = t.o2 === "" ? 100 : +t.o2;
        if (mx > mn) frac = Math.max(0, Math.min(1, (v - mn) / (mx - mn)));
      }
      let dec = t.t === "V" && t.o1 !== "" ? +t.o1 : -1;
      if (dec < 0 && unit === "W" && Math.abs(x) >= 1000) { x /= 1000; unit = "kW"; dec = Math.abs(x) < 10 ? 2 : 1; }
      if (dec < 0) dec = st.includes(".") ? (Math.abs(x) < 100 ? 1 : 0) : 0;
      val = x.toFixed(dec);
    }
    const lbl0 = t.l || s.attributes.friendly_name || t.e;
    return { lbl: lbl0 + (unit ? " " + unit : ""), val, frac };
  }

  _pal() {
    const h = this._hass, g = this._glowny();
    const ws = h.states[g.pogoda];
    const el = h.states["sun.sun"]?.attributes?.elevation;
    const e = el == null ? 30 : +el;
    return { g: wgrp(ws ? ws.state : "sunny"), t: e < -4 ? 0 : (e < 6 ? 1 : 2), cond: ws ? ws.state : "sunny" };
  }

  _acc(t, P) {
    const h = this._hass, s = h.states[t.e];
    const neutral = mix([120,150,200], sky(8, P.g, P.t), 0.35);
    if (t.t === "D") {
      const k = h.states[this._glowny().klima];
      return !k || k.state === "off" ? [110,116,130] : (HVAC_RGB[k.state] || [110,116,130]);
    }
    if (t.t === "G") {
      const z = String(h.states[t.e || ENT.g13]?.state || "").split(";")[0];
      return G13_RGB[z] || [110,116,130];
    }
    if (t.t === "K") {
      const k = h.states[t.e || this._glowny().klima];
      return !k || k.state === "off" ? [110,116,130] : (HVAC_RGB[k.state] || [110,116,130]);
    }
    if (t.t === "T") {
      const on = s && ["on", "open", "playing", "unlocked", "heat", "cool"].includes(s.state);
      return on ? ((t.e || "").startsWith("light.") ? [255,176,32] : [46,196,160]) : [110,116,130];
    }
    if (!s || isNaN(parseFloat(s.state))) return neutral;
    if (t.t === "B") return heat(this._fmtVal(t).frac);
    if (t.t === "V") {
      const u = t.o2 !== "" && t.o2 != null ? String(t.o2) : (s.attributes.unit_of_measurement || "");
      const v = parseFloat(s.state);
      if (u.includes("°")) return v < 5 ? [80,150,255] : v < 18 ? [80,200,235] : v < 24 ? [70,205,120] : v < 28 ? [255,176,32] : [255,90,60];
      if (u === "%") return [90,190,255];
    }
    return neutral;
  }

  _tileHTML(t, i, P) {
    const h = this._hass;
    const vw = this._visibleWidth();
    const px = (n) => (n / vw * 100).toFixed(3) + "cqw";  /* physical px on the visible area */
    const fitFont2 = (tx, w, hh, f) => fitFont(tx, w * vw / 480, hh, f);
    const fpx = (f) => px(FH[f] * 0.87);
    const W = t.w * 20 - 4, H = t.h * 20 - 4;
    const box = (x, y, w, hh, text, f, col, extra = "", align = "center") =>
      `<div class="val ${extra}" style="left:${(x / W * 100).toFixed(3)}%;width:${(w / W * 100).toFixed(3)}%;top:${(y / H * 100).toFixed(3)}%;height:${(hh / H * 100).toFixed(3)}%;font-size:${fpx(f)};color:${col};font-weight:${f >= 3 ? "bold" : "normal"};justify-content:${align}">${text}</div>`;
    const TL = mix([34,38,50], sky(3, P.g, P.t), 0.28);
    const pad = W >= 120 ? 10 : 6, top = 8;
    const label = (x, y, w, hh, text) => {
      let s = String(text), lf = hh >= 28 ? 1 : 0;
      if (lf) { let chars = [...s]; while (chars.length > 3 && fitFont2(chars.join(""), w, 28, 1) < 1) { chars = chars.slice(0, -2); while (chars.length && " .".includes(chars[chars.length - 1])) chars.pop(); chars.push("."); } s = chars.join(""); }
      return box(x, y, w, hh, s, lf, "rgb(222,228,240)", "", "flex-start");
    };
    let inner = "", bg = css(TL), acc = null;
    const hhmm = new Date().toLocaleTimeString(LANG, { hour: "2-digit", minute: "2-digit" });
    if (t.t === "W" || t.t === "P") {
      const g = this._glowny(), ws = h.states[g.pogoda];
      bg = `linear-gradient(${css(sky(0, P.g, P.t))},${css(sky(15, P.g, P.t))})`;
      const tsrc = g.temp_zewn && h.states[g.temp_zewn] ? h.states[g.temp_zewn].state : ws?.attributes?.temperature;
      const tv = isNaN(parseFloat(tsrc)) ? "--" : (() => { let s = (+tsrc).toFixed(1); if (s.length > 4) s = (+tsrc).toFixed(0); return s + "°"; })();
      let avail = H - 36, y = 34;
      const cl = t.t === "W" && avail >= 72; if (cl) avail -= 72;
      const th = avail >= 80 ? 80 : (avail >= 56 ? avail : 0); avail -= th;
      const cd = avail >= 30; if (cd) avail -= 30;
      const infn = avail >= 84 ? 3 : (avail >= 32 ? 1 : 0), inf = infn > 0;
      if ([0, 1, 7].includes(P.g)) inner += `<div style="position:absolute;right:${px(10)};top:${px(3)};width:${px(28)};height:${px(28)};border-radius:50%;background:${P.t === 0 ? "#ebe8d2" : P.t === 1 ? "#ff9646" : "#ffd65a"}"></div>`;
      if (cl) { inner += box(0, y, W, 72, hhmm, fitFont2(hhmm, W - 8, 72, 4), "#fff", "shadow"); y += 72; }
      if (cd) { const n = tr("w", P.cond); inner += box(0, y, W, 30, n, fitFont2(n, W - 8, 30, 1), "#e8eaf0", "shadow"); y += 30; }
      if (th) { inner += box(0, y, W, th, tv, fitFont2(tv, W - 8, th, 4), "#fff", "shadow"); y += th; }
      if (inf) {
        const pi = h.states[ENT.info];
        const l1 = pi && !["unknown", "unavailable", "-"].includes(pi.state) ? pi.state : "";
        const l2 = (pi?.attributes?.linia2 || "").split(", ");
        inner += box(0, y + 2, W, 28, l1, fitFont2(l1, W - 8, 28, 1), "#e8eaf0", "shadow");
        if (infn >= 3) {
          inner += box(0, y + 34, W, 24, l2[0] || "", 0, "#e8eaf0", "shadow");
          inner += box(0, y + 58, W, 24, l2[1] || "", 0, "#e8eaf0", "shadow");
        }
      }
    } else {
      acc = this._acc(t, P);
      if (t.t === "G" || t.t === "D") {
        /* same sky bands as the weather tile (firmware f_skyfill) */
        const wt = (this._tiles || []).find((x) => x.t === "W" || x.t === "P");
        const Y = wt ? wt.r * 20 + 2 : 0, HH = wt ? wt.h * 20 - 4 : 320;
        const band = (yy) => Math.max(0, Math.min(15, Math.floor((yy - Y) * 16 / HH)));
        const y0 = t.r * 20 + 2, y1 = y0 + H;
        const stops = [];
        for (let b = band(y0); b <= band(y1 - 1); b++) {
          const a = Math.max(y0, b === 0 ? -1000 : Y + Math.floor(b * HH / 16)), z = Math.min(y1, b === 15 ? 1000 : Y + Math.floor((b + 1) * HH / 16));
          stops.push(`${css(sky(b, P.g, P.t))} ${((a - y0) / H * 100).toFixed(2)}% ${((z - y0) / H * 100).toFixed(2)}%`);
        }
        bg = `linear-gradient(${stops.join(",")})`;
      }
      if (t.t === "C") {
        inner += box(4, 6, W - 8, H - 8, hhmm, fitFont2(hhmm, W - 12, H - 8, 4), "#fff");
      } else if (t.t === "G") {
        inner += this._g13HTML(t, W, H, pad, top, TL, box, fitFont2, px, fpx, P);
      } else if (t.t === "D") {
        inner += this._domHTML(t, W, H, pad, TL, fitFont2, P);
      } else if (t.t === "T") {
        const s = h.states[t.e], st = s ? s.state : "";
        const on = ["on", "open", "playing", "unlocked", "heat", "cool"].includes(st);
        const dom = (t.e || "").split(".")[0];
        if (on) bg = css(mix(TL, acc, 0.85));
        const fg = on ? "#121216" : "#fff";
        const l = t.l || s?.attributes?.friendly_name || T("pick_entity");
        const lh = H >= 90 ? H - 42 : H - 12;
        inner += box(pad, top, W - 2 * pad, lh, l, fitFont2(l, W - 2 * pad - 4, lh, 2), fg).replace("font-weight:bold", "font-weight:normal");
        if (H >= 90) {
          const tx = ["scene", "script"].includes(dom) ? T("run") : (!s || ["unavailable", "unknown"].includes(st) ? T("na") : on ? T("on") : T("off"));
          inner += box(pad, H - 36, W - 2 * pad, 30, tx, 1, on ? "#121216" : "rgb(200,206,220)");
        }
      } else if (t.t === "K") {
        const g = this._glowny(), k = h.states[t.e || g.klima];
        const lh = H >= 100 ? 30 : 22;
        let lab = t.l || T("climate");
        if (lab === T("climate") && fitFont2(lab, W - 2 * pad, 28, 1) < 1) lab = T("climate_short");
        inner += label(pad, top, W - 2 * pad, lh, lab);
        const off = !k || k.state === "off";
        const tg = k?.attributes?.temperature, step = k?.attributes?.target_temp_step || 1;
        const val = !k ? "--" : off ? T("off") : (tg == null ? "--" : (+tg).toFixed(step < 0.99 ? 1 : 0) + "°");
        const tail = H >= 140 ? 56 : (H >= 105 ? 30 : 0);
        const vy = top + lh, vh = H - 4 - tail - vy;
        if (vh >= 16) inner += box(4, vy, W - 8, vh, val, fitFont2(val, W - 12, vh, W >= 180 && vh >= 72 ? 4 : 3), off ? "rgb(150,156,170)" : "#fff");
        if (!off && tail >= 30) { const m = tr("h", k.state); inner += box(4, H - 4 - tail, W - 8, 28, m, fitFont2(m, W - 12, 28, 1), css(acc)).replace("font-weight:bold", "font-weight:normal"); }
        if (!off && tail >= 56 && k.attributes.fan_mode) {
          const fm = String(k.attributes.fan_mode).toLowerCase().replace(/[ -]/g, "_"), fn = tr("f", fm) === fm ? k.attributes.fan_mode : tr("f", fm);
          let f = T("airflow") + fn; if (fitFont2(f, W - 12, 26, 1) < 1) f = fn;
          inner += box(4, H - 30, W - 8, 26, f, fitFont2(f, W - 12, 26, 1), "rgb(200,206,220)");
        }
      } else {
        let { lbl, val, frac } = this._fmtVal(t);
        const lh = H >= 100 ? 30 : 22;
        const base = t.l || h.states[t.e]?.attributes?.friendly_name || "";
        if (lh >= 28 && fitFont2(lbl, W - 2 * pad, 28, 1) < 1 && base) { if (lbl.includes("°") && val !== "--") val += "°"; lbl = base; }
        inner += label(pad, top, W - 2 * pad, lh, lbl);
        const bar = t.t === "B" ? 30 : 6;
        const vy = top + lh, vh = H - bar - vy;
        const mf = W >= 180 && vh >= 72 ? 4 : 3;
        if (vh >= 16) inner += box(4, vy, W - 8, vh, val, fitFont2(val, W - 12, vh, mf), "#fff");
        if (t.t === "B") {
          const bw = W - 2 * pad;
          inner += `<div class="barbg" style="left:${(pad / W * 100).toFixed(2)}%;right:${(pad / W * 100).toFixed(2)}%;top:${((H - 24) / H * 100).toFixed(2)}%;height:${((14) / H * 100).toFixed(2)}%;background:${css(mix(TL, [0,0,0], 0.55))}"><div class="barfg" style="width:${(frac * 100).toFixed(1)}%;--full:${px(bw * vw / 480)}"></div></div>`;
        }
      }
    }
    const frame = acc && !["G", "D"].includes(t.t) ? `box-shadow:inset 0 0 0 ${px(2)} ${css(mix(acc, TL, 0.45))};` : "";
    const bar = acc && !["G", "D"].includes(t.t) ? `<div style="position:absolute;left:0;right:0;top:0;height:${px(4)};background:${css(acc)}"></div>` : "";
    const dg = this._drag;
    const cls = [i === this._sel ? "sel" : "", dg && dg.moved && !dg.handle && dg.i === i ? "drag" : "",
                 dg && dg.moved && !dg.handle && dg.swap === i ? "swap" : "",
                 dg && dg.moved && !dg.handle && dg.i === i && dg.swap === -2 ? "bad" : ""].join(" ");
    const handles = ["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((k) => `<div class="h ${k}" data-h="${k}"></div>`).join("");
    return `<div class="tile ${cls}" data-i="${i}"
      style="left:${t.c / GRID_C * 100}%;top:${t.r / GRID_R * 100}%;width:${t.w / GRID_C * 100}%;height:${t.h / GRID_R * 100}%">
      <div class="in" style="background:${bg};${frame}">${bar}${inner}</div>${handles}</div>`;
  }

  /* small SVG toolkit used by the G13 / Dom previews (tile units = firmware logical px) */
  _svgKit(fitFont2) {
    const k = { o: "" };
    k.rect = (x, y, w, h, c) => { if (w > 0 && h > 0) k.o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${css(c)}"/>`; };
    k.line = (x0, y0, x1, y1, c, sw = 1.4) => { k.o += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${css(c)}" stroke-width="${sw}"/>`; };
    /* text with drop shadow like firmware f_strt; xc 0 left, 1 centre */
    k.text = (x, y, w, h, f0, c, xc, t) => {
      if (h < 10) return;
      const tx = xc === 1 ? x + w / 2 : x, an = xc === 1 ? "middle" : "start";
      for (const sh of [1, 0]) k.o += `<text x="${tx + 2 * sh}" y="${y + h / 2 + 2 * sh}" font-size="${FH[f0] * 0.87}" fill="${sh ? "#000" : css(c)}"
        font-weight="${f0 >= 3 ? "bold" : "normal"}" text-anchor="${an}" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif">${t}</text>`;
    };
    k.fit = (t, w, h, f) => fitFont2(t, w, h, f);
    return k;
  }
  _svgWrap(o, W, H) { return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">${o}</svg>`; }
  /* sky colour at a screen row (firmware f_skyy) */
  _skyAt(yy, P) {
    const wt = (this._tiles || []).find((x) => x.t === "W" || x.t === "P");
    const Y = wt ? wt.r * 20 + 2 : 0, HH = wt ? wt.h * 20 - 4 : 320;
    return sky(Math.max(0, Math.min(15, Math.floor((yy - Y) * 16 / HH))), P.g, P.t);
  }

  /* "Dom" tile preview - mirrors firmware f_dtile v1.13 */
  _domHTML(t, W, H, pad0, TL, fitFont2, P) {
    const h = this._hass, K = this._svgKit(fitFont2), oy = t.r * 20 + 2;
    const f = String(h.states[t.e || ENT.dom]?.state || "").split(";");
    const nv = (i) => { const v = parseFloat(f[i]); return isNaN(v) ? null : v; };
    const tin = nv(0), troof = nv(1), pw = nv(2), pmax = nv(3) > 0 ? nv(3) : 2700;
    const tfmt = (v, src) => { let s = v.toFixed(String(src).includes(".") ? 1 : 0); if (s.length > 4) s = v.toFixed(0); return s + "°"; };
    const tcol = (v) => v < 5 ? [90,160,255] : v < 18 ? [80,210,245] : v < 24 ? [80,220,110] : v < 28 ? [255,180,30] : [255,80,50];
    const k = h.states[this._glowny().klima];
    const koff = !k || k.state === "off";
    const kc = koff ? [130,136,150] : (HVAC_RGB[k.state] || [130,136,150]);
    const DIM = [170,176,190], sk = (yy) => this._skyAt(oy + yy, P);
    K.rect(0, 0, W, 6, kc);
    const pad = W >= 120 ? 8 : 5;
    const gh = H >= 120 ? 10 : 8, gy = H - gh - 5, gx = pad, gw = W - 2 * pad;
    const frac = pw == null ? 0 : Math.max(0, Math.min(1, pw / pmax));
    K.rect(gx, gy, gw, gh, mix(sk(gy), [0,0,0], 0.6));
    const fw = Math.round(gw * frac);
    for (let sx = 0; sx < fw; sx += 6) { const sw = Math.min(6, fw - sx); K.rect(gx + sx, gy, sw, gh, heat((sx + sw * 0.5) / gw)); }
    const wide = W >= H * 1.3, top = 10, bottom = gy - 3;
    let hw, hh, hx, hy, ix, iy, iw, ih;
    if (wide) { hh = bottom - top; hw = Math.min(Math.floor(hh * 1.35), Math.floor((W - 2 * pad) * 60 / 100)); hx = pad; hy = top; ix = hx + hw + 8; iy = top; iw = W - pad - ix; ih = hh; }
    else { hw = W - 2 * pad; hh = Math.min(Math.floor(hw * 0.95), Math.floor((bottom - top) * 58 / 100)); hx = pad; hy = top; ix = pad; iy = hy + hh + 4; iw = W - 2 * pad; ih = bottom - iy; }
    const rc = troof == null ? DIM : tcol(troof), wc = tin == null ? DIM : tcol(tin);
    const lw = hw >= 110 ? 5 : 4, lwi = 4;
    const hb = hy + hh, rh = Math.max(20, Math.floor(hh * 42 / 100));
    const ax = hx + hw / 2, ay = hy, ey = hy + rh;
    const wl = hx + Math.floor(hw * 6 / 100), wr = hx + hw - Math.floor(hw * 6 / 100);
    const dark = mix(sk((hy + hb) / 2), [0,0,0], 0.5);
    K.o += `<polygon points="${ax},${ay} ${hx + hw},${ey} ${hx},${ey}" fill="${css(dark)}"/>`;
    K.rect(wl, ey, wr - wl, hb - ey, dark);
    const cxp = hx + Math.floor(hw * 70 / 100), chw = Math.max(8, Math.floor(hw / 11));
    const roofy = ay + (cxp - ax) / (hw / 2) * (ey - ay);
    K.rect(cxp, roofy - rh * 0.45, chw, rh * 0.45 + 3, rc);
    K.o += `<polyline points="${hx},${ey - lw / 2} ${ax},${ay + lw / 2} ${hx + hw},${ey - lw / 2}" fill="none" stroke="${css(rc)}" stroke-width="${lw}" stroke-linejoin="miter"/>`;
    K.rect(wl, ey, lwi, hb - ey, wc); K.rect(wr - lwi, ey, lwi, hb - ey, wc); K.rect(wl, hb - lwi, wr - wl, lwi, wc);
    const vroof = troof == null ? "--" : tfmt(troof, f[1]), vin = tin == null ? "--" : tfmt(tin, f[0]);
    const rbw = Math.floor(hw * 60 / 100), rbh = Math.floor(rh * 58 / 100), rby = ey - rbh - 1;
    const ibx = wl + lwi + 1, ibw = wr - wl - 2 * lwi - 2, iby = ey + 2, ibh = hb - lwi - 2 - iby;
    const lab = ibh >= 90 ? 26 : 0;
    const tg = k?.attributes?.temperature, step = k?.attributes?.target_temp_step || 1;
    const kv = !k ? "--" : koff ? T("off") : (tg == null ? "--" : (+tg).toFixed(step < 0.99 ? 1 : 0) + "°");
    const pv = pw == null ? "--" : (Math.abs(pw) >= 1000 ? (pw / 1000).toFixed(1) + " kW" : pw.toFixed(0) + " W").replace(".", ",");
    const uw = Math.min(44, Math.floor(iw / 3)), uh = Math.max(12, Math.floor(uw * 4 / 10));
    const krow = Math.floor(ih * 44 / 100), mrow = ih >= 90 ? 28 : 0, prow = ih - krow - mrow;
    const icon = K.fit(kv, iw - uw - 6, krow, 3) >= 3 || K.fit(kv, iw, krow, 3) < 3;
    const kvx = icon ? ix + uw + 6 : ix, kvw = ix + iw - kvx;
    const f1 = Math.min(K.fit(vin, ibw, ibh - lab, 3), K.fit(kv, kvw, krow, 3));
    let f2 = Math.min(K.fit(vroof, rbw, rbh, 3), K.fit(pv, iw, prow - 4, 3));
    if (f2 > f1) f2 = f1;
    if (rbh >= 14) K.text(ax - rbw / 2, rby, rbw, rbh, f2, rc, 1, vroof);
    if (lab) K.text(ibx, iby, ibw, lab, 1, DIM, 1, T("at_home"));
    if (ibh - lab >= 16) K.text(ibx, iby + lab, ibw, ibh - lab, f1, [255,255,255], 1, vin);
    if (iw >= 40 && ih >= 40) {
      const uy = iy + (krow - uh) / 2;
      if (icon) { K.o += `<rect x="${ix + 1.5}" y="${uy + 1.5}" width="${uw - 3}" height="${uh - 3}" fill="none" stroke="${css(kc)}" stroke-width="3"/>`; K.rect(ix + 6, uy + uh - 7, uw - 12, 2, kc); }
      K.text(kvx, iy, kvw, krow, f1, koff ? DIM : [255,255,255], 1, kv);
      if (mrow && !koff) {
        let m = tr("h", k.state);
        if (k.attributes.fan_mode) { const fm = String(k.attributes.fan_mode).toLowerCase().replace(/[ -]/g, "_"), m2 = m + " · " + (tr("f", fm) === fm ? k.attributes.fan_mode : tr("f", fm)); if (K.fit(m2, iw, mrow, 1) >= 1) m = m2; }
        K.text(ix, iy + krow, iw, mrow, K.fit(m, iw, mrow, 1), kc, 1, m);
      }
      const py = iy + krow + mrow;
      K.rect(ix, py, iw, 2, mix(sk(py), [255,255,255], 0.35));
      if (prow >= 18) K.text(ix, py + 3, iw, prow - 4, f2, pw == null ? DIM : heat(frac), 1, pv);
    }
    return this._svgWrap(K.o, W, H);
  }

  /* "Prad G13" tile preview - mirrors firmware f_g13 v1.13 */
  _g13HTML(t, W0, H0, pad0, top0, TL, box, fitFont2, px, fpx, P) {
    const h = this._hass, K = this._svgKit(fitFont2), oy = t.r * 20 + 2, w = W0, hgt = H0;
    const f = String(h.states[t.e || ENT.g13]?.state || "").split(";");
    const z = f[0], ok = ["P", "A", "B"].includes(z);
    const cP = [67,190,71], cA = [255,150,0], cB = [240,50,45], cS = [38,190,175], cG = [100,115,210], cN = [120,126,140];
    const zc = z === "B" ? cB : z === "A" ? cA : z === "P" ? cP : cN;
    const sk = (yy) => this._skyAt(oy + yy, P);
    const fr = w >= 120 && hgt >= 120 ? 7 : 5;
    K.rect(0, 0, w, fr, zc); K.rect(0, hgt - fr, w, fr, zc); K.rect(0, 0, fr, hgt, zc); K.rect(w - fr, 0, fr, hgt, zc);
    const X = fr + 4, Y = fr + 2, W = w - 2 * fr - 8, H = hgt - 2 * fr - 4;
    const zn = ok ? T("z." + z) : "G13", nx = ok ? (f[1] || "") : "";
    const hh = H >= 140 ? 38 : 30;
    let hh2 = 0, head = nx ? zn + " " + T("until") + nx : zn, sub = "";
    if (K.fit(head, W, hh, 2) < 2 && nx) {
      if (H >= 150) { head = zn; sub = T("until") + nx; hh2 = 26; }
      else if (K.fit(head, W, hh, 2) < 1) head = zn;
    }
    K.text(X, Y, W, hh, K.fit(head, W, hh, 2), zc, 1, head);
    if (hh2) K.text(X, Y + hh - 4, W, hh2, K.fit(sub, W, hh2, 1), [255,255,255], 1, sub);
    const segs = [...String(ok ? f[6] || "" : "").matchAll(/([PAB])(\d+)/g)].map((m) => [m[1], +m[2]]).filter((v) => v[1] < 24);
    const tick = [20,22,30], ZC = { P: cP, A: cA, B: cB };
    const top = Y + hh + (hh2 ? hh2 - 4 : 0), bot = Y + H;
    const num = (i) => { const v = parseFloat(f[i]); return ok && !isNaN(v) ? v : 0; };
    const pct = num(2), sP = num(3), sA = num(4), sB = num(5), tot = sP + sA + sB, mon = ok ? (f[7] || "") : "";
    const mh = bot - top;
    let R = Math.floor(Math.min(mh, W) / 2);
    let side = W - 2 * R >= 110;
    if (!side && W >= 2 * 40 + 110) { R = Math.floor((W - 110) / 2); side = true; }
    const below = !side && mh - 2 * Math.min(R, 40) >= 28 && tot > 0;
    if (below) R = Math.floor(Math.min(mh - 30, W) / 2);
    if (R > 90) R = 90;
    if (R < 20) return this._svgWrap(K.o, w, hgt);
    const grp = 2 * R + (below ? 30 : 0), cx = side ? X + R : X + W / 2, cy = top + R + Math.max(0, Math.floor((mh - grp) / 2));
    const t3 = R >= 40 ? Math.max(15, Math.floor(R * 22 / 100)) : Math.max(8, Math.floor(R * 22 / 100));
    const t2 = Math.max(5, Math.floor(R * 11 / 100)), t1 = Math.max(5, Math.floor(R * 11 / 100));
    const r3o = R, r3i = R - t3, r2o = r3i - 3, r2i = r2o - t2, r1o = r2i - 2, r1i = r1o - t1;
    const P2 = (r, a) => [cx + r * Math.sin(a * 2 * Math.PI), cy - r * Math.cos(a * 2 * Math.PI)];
    const arcPath = (r0, r1, a0, a1) => {
      if (a1 - a0 >= 0.9999) return `M ${cx} ${cy - r1} A ${r1} ${r1} 0 1 1 ${cx - 0.01} ${cy - r1} L ${cx - 0.01} ${cy - r0} A ${r0} ${r0} 0 1 0 ${cx} ${cy - r0} Z`;
      const lg = a1 - a0 > 0.5 ? 1 : 0, [x0, y0] = P2(r1, a0), [x1, y1] = P2(r1, a1), [x2, y2] = P2(r0, a1), [x3, y3] = P2(r0, a0);
      return `M ${x0} ${y0} A ${r1} ${r1} 0 ${lg} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${lg} 0 ${x3} ${y3} Z`;
    };
    const arc = (r0, r1, a0, a1, c) => { if (a1 > a0) K.o += `<path d="${arcPath(r0, r1, a0, a1)}" fill="${css(c)}"/>`; };
    const rad = (a, r0, r1, c, sw) => { const [x0, y0] = P2(r0, a), [x1, y1] = P2(r1, a); K.line(x0, y0, x1, y1, c, sw); };
    const r0c = mix(sk(cy), [0,0,0], 0.45);
    /* ring 3: 24 h dial, 0:00 at the top, clockwise */
    if (!segs.length) arc(r3i, r3o, 0, 1, r0c);
    segs.forEach((v, k) => { const a = v[1], b = k + 1 < segs.length ? segs[k + 1][1] : 24; arc(r3i, r3o, a / 24, b / 24, ZC[v[0]]); });
    for (let hr = 0; hr < 24; hr++) { const major = hr % 6 === 0; rad(hr / 24, major ? r3i : r3o - t3 * 0.45, r3o, tick, major ? 3 : 1.2); }
    /* ring 2: saved vs paid, ring 1: kWh per zone */
    const f1 = Math.max(0, Math.min(1, pct / 100));
    if (ok) { arc(r2i, r2o, 0, f1, cS); arc(r2i, r2o, f1, 1, cG); } else arc(r2i, r2o, 0, 1, r0c);
    if (tot > 0) { const a0 = sP / tot, a1 = (sP + sA) / tot; arc(r1i, r1o, 0, a0, cP); arc(r1i, r1o, a0, a1, cA); arc(r1i, r1o, a1, 1, cB); }
    else arc(r1i, r1o, 0, 1, r0c);
    if (t3 >= 15) {
      const lb = ["0", "6", "12", "18"], rm = (r3o + r3i) / 2;
      lb.forEach((t0, q) => { const [lx, ly] = P2(rm, q / 4), bw2 = q >= 2 ? 26 : 18, ox = q === 1 ? -bw2 - 3 : (q === 3 ? 4 : -bw2 / 2); K.text(lx + ox, ly - 9, bw2, 18, 0, [255,255,255], 1, t0); });
    }
    if (segs.length) {
      const d = new Date(), a = (d.getHours() * 60 + d.getMinutes()) / 1440;
      rad(a, r3i - 2, r3o + 4, tick, 7); rad(a, r3i - 2, r3o + 4, [255,255,255], 4);
    }
    /* centre + legend */
    const hole = r1i - 1, ct = ok ? pct.toFixed(0) + "%" : "--", chh = Math.min(2 * hole - 4, 60);
    const centre = hole >= 14 && K.fit(ct, 2 * hole - 6, chh, 3) >= 1;
    if (centre) K.text(cx - hole, cy - chh / 2, 2 * hole, chh, K.fit(ct, 2 * hole - 6, chh, 3), [255,255,255], 1, ct);
    const sh = (v) => (tot > 0 ? v * 100 / tot : 0).toFixed(0) + "%";
    const l1 = T("cheap_x") + sh(sP), l2 = T("med_x") + sh(sA), l3 = T("exp_x") + sh(sB);
    const m4 = !centre && ok ? T("cheaper") + ct : (mon ? "+" + mon + T("per_month") : "");
    if (side) {
      const lx = X + 2 * R + 10, lw = X + W - lx;
      let n = (!m4 || 2 * R < 4 * 26) ? 3 : 4;
      const legf = (rows) => { const rh = Math.min(40, Math.floor(2 * R / rows)); let q = Math.min(2, K.fit(l1, lw, rh, 2), K.fit(l2, lw, rh, 2), K.fit(l3, lw, rh, 2)); if (rows === 4) q = Math.min(q, K.fit(m4, lw, rh, 2)); return q; };
      if (n === 4 && centre && legf(4) < legf(3)) n = 3;
      const rowh = Math.min(40, Math.floor(2 * R / n)), lf = legf(n), ly = cy - n * rowh / 2;
      K.text(lx, ly, lw, rowh, lf, cP, 0, l1); K.text(lx, ly + rowh, lw, rowh, lf, cA, 0, l2); K.text(lx, ly + 2 * rowh, lw, rowh, lf, cB, 0, l3);
      if (n === 4) K.text(lx, ly + 3 * rowh, lw, rowh, lf, cS, 0, m4);
    } else if (below) {
      const ly = cy + R + 2, cw = Math.floor(W / 3), lf = Math.min(K.fit(sh(sA), cw - 4, 28, 2), K.fit(sh(sP), cw - 4, 28, 2));
      K.text(X, ly, cw, 28, lf, cP, 1, sh(sP)); K.text(X + cw, ly, cw, 28, lf, cA, 1, sh(sA)); K.text(X + 2 * cw, ly, W - 2 * cw, 28, lf, cB, 1, sh(sB));
    }
    return this._svgWrap(K.o, w, hgt);
  }

  _renderCanvas() {
    const cv = this.shadowRoot && this.shadowRoot.getElementById("cv");
    if (!cv || !this._hass) return;
    if (this._tiles === null) { cv.innerHTML = '<div class="grid"></div>'; return; }
    cv.style.setProperty("--vw", this._visibleWidth());
    const P = this._pal();
    cv.style.background = css(mix([8,9,14], sky(0, P.g, P.t), 0.22));
    const dg = this._drag;
    const list = dg && dg.moved && !dg.handle ? this._tiles.map((t, i) => (i === dg.i ? t : dg.snap[i])) : this._tiles;
    cv.innerHTML = '<div class="grid"></div>' + list.map((t, i) => this._tileHTML(t, i, P)).join("");
  }

  _suggest(type) {
    const h = this._hass;
    const rank = { V: ["temperature", "humidity", "power", "energy", "illuminance", "carbon_dioxide", "pm25", "voltage"],
                   B: ["power", "humidity", "battery", "illuminance", "carbon_dioxide"] };
    let ids = Object.keys(h.states).filter((e) => {
      const d = e.split(".")[0], s = h.states[e];
      if (type === "K") return d === "climate";
      if (type === "G") return d === "sensor";
      if (type === "D") return d === "sensor";
      if (type === "T") return ["light", "switch", "input_boolean", "fan", "cover", "scene", "script", "lock"].includes(d);
      if (type === "V") return ["sensor", "binary_sensor", "number", "input_number"].includes(d);
      if (type === "B") return ["sensor", "number", "input_number"].includes(d) && !isNaN(parseFloat(s.state));
      return false;
    });
    const r = rank[type] || [];
    const score = (e) => { const i = r.indexOf(h.states[e].attributes.device_class); return i < 0 ? 99 : i; };
    ids.sort((a, b) => score(a) - score(b) || a.localeCompare(b));
    return ids.slice(0, 400).map((e) => `<option value="${e}">${(h.states[e].attributes.friendly_name || "").replace(/"/g, "")}</option>`).join("");
  }

  _renderSide() {
    const side = this.shadowRoot.getElementById("side");
    if (!side) return;
    const t = this._tiles && this._tiles[this._sel];
    if (!t) {
      side.innerHTML = `<div class="hint">${T("help")}</div>`;
      return;
    }
    const needE = ["V", "B", "T", "K", "G", "D"].includes(t.t);
    const wxNote = (t.t === "W" || t.t === "P") ? `<div class="hint">${T("weather_note", this._glowny().pogoda || T("unset"))}</div>` : "";
    const o = t.t === "V" ? [T("o_dec"), T("o_unit")]
            : t.t === "B" ? [T("o_min"), T("o_max")] : null;
    side.innerHTML = `
      <label>${T("type")}<select id="p_t">${Object.keys(TYPES).map((k) => `<option value="${k}" ${k === t.t ? "selected" : ""}>${T("type." + k)}</option>`).join("")}</select></label>
      ${needE ? `<label>${T("entity")}<input id="p_e" list="dl" value="${t.e}" placeholder="${t.t === "K" ? T("ph_climate") : T("ph_entity")}"><datalist id="dl">${this._suggest(t.t)}</datalist></label>` : ""}
      ${wxNote}
      ${t.t === "G" ? `<div class="hint">${T("g13_hint", ENT.g13)}</div>` : ""}
      ${t.t === "D" ? `<div class="hint">${T("dom_hint", ENT.dom)}</div>` : ""}
      ${!["W", "P", "C", "G", "D"].includes(t.t) ? `<label>${T("label")}<input id="p_l" value="${String(t.l).replace(/"/g, "&quot;")}"></label>` : ""}
      ${o ? `<label>${o[0]}<input id="p_o1" value="${t.o1}"></label><label>${o[1]}<input id="p_o2" value="${t.o2}"></label>` : ""}
      <div class="hint">${T("pos", t.c + 1, t.r + 1, t.w, t.h, t.w * 20 - 4, t.h * 20 - 4)}</div>`;
    const q = (id) => this.shadowRoot.getElementById(id);
    q("p_t").onchange = (ev) => {
      const nt = ev.target.value;
      if ((nt === "W" || nt === "P") && this._tiles.some((x) => x !== t && (x.t === "W" || x.t === "P"))) {
        this._msg = T("only_one_weather_short");
        this._renderAll();
        return;
      }
      t.t = nt;
      const m = TYPES[t.t].min;
      t.w = Math.max(t.w, m[0]); t.h = Math.max(t.h, m[1]);
      t.c = Math.min(t.c, GRID_C - t.w); t.r = Math.min(t.r, GRID_R - t.h);
      if (t.t === "B" && t.o2 === "") { t.o1 = 0; t.o2 = 100; }
      if (t.t === "G") { t.e = t.e && t.e.split(".")[0] === "sensor" ? t.e : ENT.g13; t.o1 = ""; t.o2 = ""; }
      if (t.t === "D") { t.e = t.e && t.e.split(".")[0] === "sensor" ? t.e : ENT.dom; t.o1 = ""; t.o2 = ""; }
      this._changed();
    };
    const bind = (id, key) => { const el = q(id); if (el) el.onchange = () => { t[key] = el.value.trim(); this._changed(); }; };
    bind("p_e", "e"); bind("p_l", "l"); bind("p_o1", "o1"); bind("p_o2", "o2");
  }
}

if (!customElements.get("nspanel-dom-editor-card")) {
  customElements.define("nspanel-dom-editor-card", NSPanelDomEditorCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "nspanel-dom-editor-card",
    name: `${TR.en.card_name} v${VERSION}`,
    description: TR.en.card_desc,
    preview: false,
  });
  console.info(`%c NSPanel Dom editor %c v${VERSION} `, "background:#03a9f4;color:#fff;padding:2px 4px", "background:#333;color:#fff;padding:2px 4px");
} else {
  console.warn("NSPanel Dom editor: " + TR.en.dup);
}

