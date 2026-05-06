# Raktár Manager Projekt

## A Projekt Célja
A Raktár Manager egy átfogó, modern webalkalmazás, amely egy webshopot és egy komplex raktárkezelő, valamint logisztikai rendszert foglal magába. A szoftver célja, hogy egy felületen szolgálja ki a vásárlókat (termékek böngészése, kosár, rendelés), és biztosítson dedikált adminisztrációs felületeket a menedzsment (Admin), a raktárosok (Warehouseman) és a fuvarozók (Carrier) számára.

## Architektúra és Technológiák

A projekt egy szeparált frontend-backend architektúrára épül.

### Backend (RaktarManager)
- **Nyelv**: Python 3
- **Keretrendszer**: Flask & APIFlask
- **Adatbázis ORM**: SQLAlchemy (Flask-SQLAlchemy)
- **Adatbázis Migrációk**: Flask-Migrate (Alembic)
- **Autentikáció & Biztonság**: JWT / Authlib, bcrypt
- **Struktúra**: Moduláris Flask alkalmazás, blueprint-ekkel és validált API végpontokkal.

### Frontend (frontend)
- **Nyelv**: TypeScript
- **Könyvtár**: React 19
- **Build tool**: Vite
- **Routing**: React Router DOM (v7)
- **Állapotkezelés**: React Context API (AuthContext, CartContext)
- **HTTP Kliens**: Axios
- **Stílusozás**: Vanilla CSS (CSS Modules / BEM konvenciók) és modern UI elemek (Lucide React ikonok).
- **Értesítések**: React Hot Toast

## Implementációs Fázisok (Frontend)

Az alkalmazás fejlesztése több fázisra bontható a `frontend_implementation_plan.md` alapján:

### 1. Fázis: Infrastruktúra és Alapok (Befejezve)
- React Router alapú navigáció beállítása (`/`, `/login`, `/register`, `/profile`, `/checkout`).
- Globális állapotkezelés az AuthContext és CartContext segítségével.
- Védett útvonalak (`ProtectedRoute`) implementálása.

### 2. Fázis: Felhasználói Funkciók (Befejezve)
- Termékkatalógus megjelenítése.
- Kosár és megrendelés (checkout) folyamat.
- Felhasználói profil kezelése.

### 3. Fázis: Szerepkör-alapú Dashboardok (Folyamatban)
- **Admin Felület**: Statisztikák, felhasználó- és termékkezelés.
- **Raktáros Felület**: Készletmozgás, bevételezés/kiadás, tárolóhelyek kezelése.
- **Megrendelés Kezelés**: Státuszváltó workflow.

### 4. Fázis: Speciális Modulok és Finomhangolás
- **Reklamáció Kezelés**: Vásárlói reklamációk beküldése és adminisztrátori elbírálása.
- **Fuvarozó Felület**: Napi szállítási feladatok és kiszállítások megerősítése.
- **UI/UX Polishing**: Értesítések (Toasts), betöltést jelző skeletonok, mobil-optimalizálás.

## Telepítés és Futtatás

### Előfeltételek
- Node.js (v18+)
- Python (3.10+)

### Backend indítása
```bash
cd RaktarManager
pip install -r requirements.txt
flask run
```

### Frontend indítása
```bash
cd frontend
npm install
npm run dev
```

## Szerepkörök és Jogosultságok
A rendszer több jogosultsági szinttel rendelkezik:
- **Vásárló / User**: Webshop használata, rendelések leadása.
- **Admin**: Teljes körű hozzáférés a rendszerhez.
- **Raktáros (Warehouseman)**: Készlet kezelése és raktári mozgások.
- **Fuvarozó (Carrier)**: Szállítási feladatok és címek kezelése.
