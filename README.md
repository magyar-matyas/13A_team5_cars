**13A_team5_cars**

- **Leírás:** Kis Express + Mongoose szolgáltatás, amely autómárkákat és autómodelleket kezel. Tartalmaz unit és route teszteket (Jest + supertest). A route tesztek egy része Mongoose metódusokat mockol, így nem szükséges élő adatbázis a futtatáshoz; a sémavizsgálatokhoz in-memory MongoDB-t használunk.

**Gyors kezdés**
- Előfeltételek: Node.js (14+), npm.
- Klónozd a repository-t és telepítsd a függőségeket:

```powershell
cd d:\ak\teszt\13A_team5_cars
npm install
```

**Környezet**
- Állítsd be a `MONGO_URI` változót nem-teszt futtatásokhoz (pl. lokális MongoDB). A tesztek modell szintű ellenőrzései `mongodb-memory-server`-t használnak, így nem kell teljesen futó MongoDB a tesztekhez.

Példa `.env` (opcionális):
```
MONGO_URI=mongodb://127.0.0.1:27017/yourdb
PORT=3000
```

**Szerver futtatása**
- Fejlesztés (a `server.js` kapcsolódik a `MONGO_URI`-hez, kivéve ha `NODE_ENV=test`):

```powershell
# PowerShell vagy cmd használható; győződj meg, hogy a MONGO_URI be van állítva
node server.js
```

**Tesztek futtatása**
- Ajánlott (Windows): futtasd a teszteket `cmd`-ből a PowerShell execution-policy problémák elkerüléséhez:

```powershell
cmd /c npm test
```

- PowerShell-en is futtathatod `npm test` parancsot, ha nincs korlátozó execution-policy.
- Egyetlen tesztfájl futtatása Jest-tel (példa):

```powershell
npx jest tests/carModel.endpoints.mock.test.js
```

**Megjegyzések a tesztekről**
- A route tesztek CI-barát módon készültek: sok route teszt mockolja a Mongoose modell metódusokat (`find`, `findOne().sort()`, `countDocuments`, példány `save`, `findByIdAndUpdate`, `findByIdAndDelete`) `jest.spyOn(...)` segítségével, így nem igényelnek élő DB-t.
- A modell szintű tesztek (`tests/carBrand.test.js`, `tests/carModel.test.js`) `mongodb-memory-server`-t használnak, hogy éles környezet nélküli sémavalidációt és egyediség ellenőrzést tegyenek.
- Ha zajos konzol kimenetet látsz a tesztek alatt, az a `routes/carModelRoutes.js` fájl debug `console.log`/`console.error` hívásai miatt van. Ezeket eltávolíthatod vagy feltételesen meghívhatod (`if (process.env.NODE_ENV !== 'test')`), hogy csendesítsd a teszteket.

**API végpontok (összefoglaló)**
- Márkák (`/brands`)
  - GET `/brands` — az összes márka listázása
  - POST `/brands` — márka létrehozása. A szerver generál `_id`-t `BR001` formátumban a legmagasabb létező `_id` alapján. A kérés törzsének tartalmaznia kell a kötelező mezőket: `brand_name`, `country_of_origin`, `founded_year`, `website`.
  - GET `/brands/:brand_id/models` — egy márkához tartozó modellek listázása (szűrés `brand_id` szerint).
  - PUT `/brands/:id` — márka frissítése id alapján (404, ha nem található).
  - DELETE `/brands/:id` — márka törlése id alapján (404, ha nem található).

- Modellek (`/models`)
  - GET `/models` — az összes modell listázása
  - POST `/models` — modell létrehozása. A szerver generál `_id`-t `M001` formátumban `countDocuments()` alapján; a kérés törzsének tartalmaznia kell a kötelező mezőket: `model_name`, `brand_id`, `year`, `car_type`, `price`.
  - PUT `/models/:id` — modell frissítése id alapján (404, ha nem található).
  - DELETE `/models/:id` — modell törlése id alapján (404, ha nem található).

**Projekt felépítése (fontos fájlok)**
- `app.js` — Express alkalmazás, amely exportálja az útvonalakat a tesztekhez
- `server.js` — indítja a szervert (kapcsolódik a MongoDB-hez, kivéve ha `NODE_ENV=test`)
- `routes/` — `carBrandRoutes.js`, `carModelRoutes.js`
- `models/` — `CarBrand.js`, `CarModel.js` (Mongoose sémák)
- `tests/` — Jest tesztek (mockolt route tesztek és in-memory modell tesztek keveréke)

**Gyakori fejlesztési feladatok**
- Tesztek futtatása: `cmd /c npm test`
- Egyetlen tesztfájl futtatása: `npx jest path/to/test.file.js`
- Szerver lokálisan indítása: `node server.js` (ellenőrizd, hogy a `MONGO_URI` be van-e állítva)

**Hozzájárulás**
- Előnyben részesítsd a mockolt route tesztek hozzáadását, hogy a CI gyors és determinisztikus maradjon.
- A modell séma teszteket tartsd meg `mongodb-memory-server`-rel a sémaellenőrzésekhez.

Ha szeretnéd, megtehetem:
- Eltávolítom vagy feltételesen megjelenítem a debug logokat a `routes/carModelRoutes.js`-ben, hogy csökkentsem a tesztek kimeneti zaját, és újrafuttatom a teszteket.
- Hozzáadok `Makefile`-t/`npm` script parancsokat a gyakori feladatokhoz.

---
_A fájlt a repository karbantartó eszköze segédletével generáltam. Kérdések esetén nyiss issue-t vagy jelezd a csapatnak._
