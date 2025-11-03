# GeneRozkaz
# PL 🇵🇱
Generator online dla nowych kolejowych rozkazów pisemnych

<img width="697" height="417" alt="obraz" src="https://github.com/user-attachments/assets/112305da-8c60-4c37-be8b-0692a6399099" />

## Funkcje
- [ ] Walidacja poprawności wypełnienia rozkazu
  - [x] Zaznaczanie pól wymaganych i opcjonalnych
  - [x] Zablokowanie możliwości wydania wykluczonych instrukcji
  - [ ] Walidacja niektórych pól względem schematu (w ograniczonym zakresie)
- [ ] Informacja o ty co należy wpisać w danym polu
- [ ] Tryb integracji z symulatorem TD2 (automatyczne uzupełnianie pól)
- [ ] Tryb drukowania
- [ ] Generowanie tekstowej wersji rozkazu (np. dla symulatorów)

## Obsługiwane wersje rozkazu
- [x] Normalna
- [ ] ETCS

## Oznaczenia
### Kolor pola
- To pole jest wymagane

  <img width="348" height="52" alt="obraz" src="https://github.com/user-attachments/assets/fb0b5924-d775-48cf-9529-58aac9d11b62" />
- To pole może być wypełnione (w zależności od potrzeb)

  <img width="234" height="50" alt="obraz" src="https://github.com/user-attachments/assets/8635b917-616a-4a96-acdf-a996981756b2" />

> [!WARNING]
> Pozostałe pola (nie oznaczene kolorem i nie wypełnione) powinny zostać puste!

### Oznaczenie wiersza
- Ta instrukcja nie może być wydana równocześnie z inną zaznaczoną instrukcją

  <img width="900" height="98" alt="obraz" src="https://github.com/user-attachments/assets/e9547a47-8e5a-45c1-8a8c-baba1203d712" />


# EN 🇬🇧
Online generator for new Polish written orders

<img width="697" height="417" alt="obraz" src="https://github.com/user-attachments/assets/112305da-8c60-4c37-be8b-0692a6399099" />

## Functions
- [ ] Validation of input fields
  - [x] Highlight of required and optional fields
  - [x] Blocking the possibility of issuing incompatible instructions (like `21.10` and `21.15`)
  - [ ] Validation of certain fields against the schema (limited)
- [ ] Information about what to enter in a given field
- [ ] Integration with TD2 simulator (autocomplete fields)
- [ ] Print mode
- [ ] Generation of a text version of the order (e.g. for simulators)

# Supported written order versions
- [x] Normal
- [ ] ETCS

## Markings
### Field background
- This field is required

  <img width="348" height="52" alt="obraz" src="https://github.com/user-attachments/assets/fb0b5924-d775-48cf-9529-58aac9d11b62" />
- This field is optional (as applicable)

  <img width="234" height="50" alt="obraz" src="https://github.com/user-attachments/assets/8635b917-616a-4a96-acdf-a996981756b2" />

> [!WARNING]
> The rest of the fields (without text and background) should not be filled in!

### Row indicators 
- This instruction and other one can´t be selected simultaneously
  
  <img width="900" height="98" alt="obraz" src="https://github.com/user-attachments/assets/e9547a47-8e5a-45c1-8a8c-baba1203d712" />
