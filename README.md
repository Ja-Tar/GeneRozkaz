# GeneRozkaz
# PL 🇵🇱
Generator online dla nowych kolejowych rozkazów pisemnych

<img width="940" height="483" alt="obraz" src="https://github.com/user-attachments/assets/de3ff470-0762-422a-83cd-a63b334485f1" />

> [!IMPORTANT]
> Opracowano na podstawie **instrukcji Ir-1 (zm. 18)** oraz materiałów z kanału [Michał Piątkowski](https://www.youtube.com/@MichalPiatkowski).

## Funkcje
- [x] Walidacja poprawności wypełnienia rozkazu
  - [x] Zaznaczanie pól wymaganych i opcjonalnych
  - [x] Zablokowanie możliwości wydania wykluczonych instrukcji
  - [x] Walidacja niektórych pól względem schematu (w ograniczonym zakresie)
- [x] Informacja o ty co należy wpisać w danym polu
- [ ] Możliwość zapisu
  - [x] PDF / Drukowanie
  - [ ] TXT (do skopiowania, dla symulatorów)
- [ ] Opcje automatycznego uzupełnianie pól (można je włączyć w ustawianiach)
  - [ ] z symulatora TD2
  - [x] aktualna data jako data wystawienia rozkazu
  - [x] ustawienie stałego identyfikatora nadawcy
  - [x] automatyczne zwiększanie numeru rozkazu
  - [x] zachowywanie numeru rozkazu
- [x] Tryb ciemny - na stronie
  - [x] Podgląd
  - [x] Generator

## Obsługiwane wersje rozkazu
- [x] Normalna
- [ ] ETCS

## Oznaczenia
### Kolor pola
- To pole jest wymagane

  <img width="348" height="52" alt="obraz" src="https://github.com/user-attachments/assets/fb0b5924-d775-48cf-9529-58aac9d11b62" />
- To pole może być wypełnione (w zależności od potrzeb)

  <img width="234" height="50" alt="obraz" src="https://github.com/user-attachments/assets/8635b917-616a-4a96-acdf-a996981756b2" />

> [!TIP]
> Żeby edytować pola kliknij na kwadracik (checkbox) danej instrukcji.

> [!NOTE]
> Jeśli kolor nie zniknie po wpisaniu rzeczy to oznacza że pole jest nieprawidłowo wypełnione.

### Oznaczenie wiersza
- Ta instrukcja nie może być wydana równocześnie z inną zaznaczoną instrukcją

  <img width="900" height="98" alt="obraz" src="https://github.com/user-attachments/assets/e9547a47-8e5a-45c1-8a8c-baba1203d712" />


# EN 🇬🇧
Online generator for new Polish written orders for railways

<img width="940" height="483" alt="obraz" src="https://github.com/user-attachments/assets/de3ff470-0762-422a-83cd-a63b334485f1" />

> [!IMPORTANT]
> Webpage is based on **Instruction Ir-1 (rev. 18)** and materials from [Michał Piątkowski's](https://www.youtube.com/@MichalPiatkowski) channel.

## Functions
- [x] Validation of input fields
  - [x] Highlight of required and optional fields
  - [x] Blocking the possibility of issuing incompatible instructions (like `21.10` and `21.15`)
  - [x] Validation of certain fields against the schema (limited)
- [x] Information about what to enter in a given field
- [ ] Save options
  - [x] PDF and printing
  - [ ] TXT (to copy paste into simulators)
- [ ] Autocomplete fields options (can be turned on in the settings)
  - [ ] TD2 simulator
  - [x] current date as the date of issue of the written order
  - [x] permanent issuer ID
  - [x] auto-incrementing order number
  - [x] retention of order number
- [x] Dark mode
  - [x] View page
  - [x] Main page

# Supported written order versions
- [x] Normal
- [ ] ETCS

## Markings
### Field background
- This field is required

  <img width="348" height="52" alt="obraz" src="https://github.com/user-attachments/assets/fb0b5924-d775-48cf-9529-58aac9d11b62" />
- This field is optional (as applicable)

  <img width="234" height="50" alt="obraz" src="https://github.com/user-attachments/assets/8635b917-616a-4a96-acdf-a996981756b2" />

> [!TIP]
> To enable fields click on the instruction checkbox.

> [!NOTE]
> If background doesn't disappear, the field is wrongly fild in!

### Row indicators 
- This instruction and other one can´t be selected simultaneously
  
  <img width="900" height="98" alt="obraz" src="https://github.com/user-attachments/assets/e9547a47-8e5a-45c1-8a8c-baba1203d712" />
