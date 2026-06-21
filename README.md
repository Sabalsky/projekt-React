# Projekt – system aukcyjny (REST API)

Projekt zaliczeniowy na przedmiot *Tworzenie usług sieciowych REST*.

Aplikacja to prosty serwis aukcji internetowych. Można założyć konto, wystawić przedmiot
na licytację, przeglądać aukcje innych i składać oferty. Backend udostępnia REST API,
a frontend (React) korzysta tylko z tego API – nigdzie nie łączy się sam z bazą danych.

## Użyte technologie

Backend napisałem w Node.js z Express. Dane trzymam w bazie SQLite – skorzystałem
z wbudowanego modułu `node:sqlite`, żeby nie instalować dodatkowych paczek (próbowałem
najpierw `better-sqlite3`, ale miałem problemy z kompilacją na Windowsie).

- logowanie: JWT (token w nagłówku `Authorization: Bearer ...`), hasła hashowane bcryptem
- walidacja danych wejściowych: express-validator
- dokumentacja API: Swagger (OpenAPI) pod `/api-docs`
- logi: winston + morgan

Frontend to React + Vite, routing na react-router-dom.

## Struktura projektu

Wszystko jest w katalogu `react/`:

```
react/
├── backend/    – REST API (Node + Express + SQLite)
└── frontend/   – aplikacja w React
```

Backend rozbiłem na warstwy, żeby nie trzymać wszystkiego w jednym pliku:

```
backend/src/
├── routes/         – ścieżki (np. /auctions)
├── controllers/    – odbierają request, zwracają odpowiedź z kodem HTTP
├── services/       – logika biznesowa (np. czy oferta jest wyższa od aktualnej)
├── repositories/   – zapytania SQL do bazy
├── dto/            – zamiana rekordu z bazy na to, co zwraca API (bez hasła!)
├── middleware/     – autoryzacja JWT, walidacja, obsługa błędów
├── validators/     – reguły walidacji dla poszczególnych tras
├── config/         – baza, logger, konfiguracja, definicja Swaggera
├── app.js          – konfiguracja Express
├── server.js       – uruchomienie serwera
└── seed.js         – wrzucenie przykładowych danych do bazy
```

Chodziło o to, żeby controller nie wiedział nic o SQL, a repository nie zajmowało się
regułami aukcji – każda warstwa robi swoje.

## Baza danych

Trzy tabele:

- **users** – id, username (unikalny), email (unikalny), hash hasła
- **auctions** – tytuł, opis, kategoria, cena wywoławcza, aktualna cena, data startu i końca,
  owner_id (kto wystawił)
- **bids** – auction_id, bidder_id, kwota, data – czyli historia ofert

Powiązania: aukcja należy do użytkownika (owner_id), oferta należy do aukcji i do
użytkownika. Ustawiłem `ON DELETE CASCADE`, więc jak usunę użytkownika, to znikają też
jego aukcje i oferty.

Statusu aukcji (aktywna / zakończona / zaplanowana) nie trzymam w bazie – wyliczam go
na podstawie dat i aktualnego czasu.

(Diagram ERD jest w sprawozdaniu / dokumentacji.)

## Jak uruchomić

### Czego potrzeba

- **Node.js w wersji co najmniej 22** (korzystam z wbudowanego modułu `node:sqlite`).
  Sprawdzenie wersji: `node -v`. Jak masz starszy, pobierz nowy z https://nodejs.org.
- npm (instaluje się razem z Node).
- Bazy danych nie trzeba instalować – SQLite siedzi w pliku, tworzy się sam przy starcie.

Aplikacja to dwie osobne części (backend i frontend), więc trzeba **otworzyć dwa terminale
i mieć oba uruchomione naraz**.

### Krok 1 – sklonuj repozytorium

```bash
git clone https://github.com/Sabalsky/projekt-React.git
cd projekt-React
```

### Krok 2 – backend (pierwszy terminal)

```bash
cd backend
npm install
npm run seed     # wrzuca przykładowe aukcje i konta testowe (zalecane przy pierwszym razie)
npm start
```

Backend działa na **http://localhost:3000**, dokumentacja Swagger na
**http://localhost:3000/api-docs**. Ten terminal zostaw otwarty.

> Uwaga: jak `npm start` zgłosi brak pliku `.env`, skopiuj przykładowy:
> `copy .env.example .env` (Windows) lub `cp .env.example .env` (Linux/Mac).
> Domyślne ustawienia działają od ręki, więc nic nie trzeba zmieniać.

### Krok 3 – frontend (drugi terminal)

```bash
cd frontend
npm install
npm run dev
```

### Krok 4 – otwórz w przeglądarce

Wejdź na **http://localhost:5173** – to jest aplikacja. Frontend sam łączy się z backendem
(Vite przekierowuje zapytania `/api` na port 3000, więc CORS nie przeszkadza).

Zaloguj się jednym z kont testowych (hasło do wszystkich: `haslo123`):
**alice@example.com**, **bob@example.com**, **carol@example.com** – albo załóż własne przez „Zaloguj".

### Zatrzymanie

`Ctrl + C` w obu terminalach.

### Alternatywnie – backend w Dockerze

Sam backend można odpalić bez instalowania Node, jednym poleceniem:

```bash
cd backend
docker compose up --build
```

## Endpointy

Pełną listę z opisami i możliwością testowania mam w Swaggerze (`/api-docs`). W skrócie:

Użytkownicy / logowanie:
- `POST /auth/register` – rejestracja, w odpowiedzi token
- `POST /auth/login` – logowanie, w odpowiedzi token
- `POST /users` – dodanie użytkownika (to samo co rejestracja)
- `GET /users` – lista użytkowników
- `GET /users/:id` – jeden użytkownik
- `PUT /users/:id` – edycja (tylko swojego konta)
- `DELETE /users/:id` – usunięcie (tylko swojego konta)

Aukcje:
- `GET /auctions` – lista, można filtrować i sortować (patrz niżej)
- `GET /auctions/:id` – jedna aukcja
- `POST /auctions` – wystawienie przedmiotu (trzeba być zalogowanym)
- `PUT /auctions/:id` – edycja (tylko swojej aukcji)
- `DELETE /auctions/:id` – usunięcie (tylko swojej aukcji)

Licytacja:
- `POST /auctions/:id/bids` – złożenie oferty (trzeba być zalogowanym)
- `GET /auctions/:id/bids` – historia ofert danej aukcji

Do `GET /auctions` można dodać parametry: `page`, `limit`, `category`,
`status` (active/ended/scheduled), `sortBy` (created_at/end_date/current_price/title)
oraz `order` (asc/desc).

Kody odpowiedzi jakie zwracam: 200, 201, 204, 400 (błąd walidacji albo złamana reguła),
401 (brak/zły token), 403 (brak uprawnień), 404 (nie ma takiego zasobu), 409 (np. zajęty email).

## Reguły licytacji

Najważniejsza część logiki, czyli co sprawdzam przy składaniu oferty:

- oferta musi być wyższa niż aktualna cena, inaczej 400
- nie można licytować przed startem ani po końcu aukcji
- nie można licytować własnej aukcji
- po przyjęciu oferty aktualizuję cenę aukcji i dopisuję ofertę do historii

## Testy

```bash
cd backend
npm test
```

Napisałem testy w Jest + supertest (15 sztuk). Lecą na bazie w pamięci, więc nie ruszają
prawdziwych danych. Sprawdzają CRUD, walidację, logowanie i wszystkie reguły licytacji.

## Co dodatkowo zrobiłem (na dodatkowe punkty)

- autoryzacja JWT
- paginacja, filtrowanie i sortowanie aukcji
- Docker (docker-compose)
- testy
- logowanie operacji do pliku i konsoli
