# Frontend Implementációs Terv - Raktár Manager

Ez a dokumentum részletezi a **Raktár Manager** projekt React (TypeScript) frontendjének fejlesztési lépéseit a `PROJECT.md` és a meglévő backend API alapján.

## 1. Fázis: Infrastruktúra és Alapok (Megalapozás)

A jelenlegi "egy oldalas" (conditional rendering) struktúrát le kell váltani egy skálázhatóbb architektúrára.

- [ ] **Routing (React Router) beállítása**:
  - `react-router-dom` implementálása az `App.tsx`-ben.
  - Útvonalak definiálása: `/`, `/login`, `/register`, `/profile`, `/product/:id`, `/dashboard`, `/admin/*`.
- [ ] **Globális Állapotkezelés (AuthContext)**:
  - Felhasználói adatok, szerepkör (role) és token tárolása.
  - Automatikus login check (localStorage alapján).
- [ ] **API Szerviz Réteg**:
  - `axios` instance létrehozása központi hiba- és tokenkezeléssel.
  - API végpontok moduláris szervezése (`services/auth.ts`, `services/product.ts`, stb.).
- [ ] **Layout Rendszer**:
  - `PublicLayout`: Navbárral és lábléccel (Webshop rész).
  - `DashboardLayout`: Oldalsó menüvel (Admin, Raktáros, Fuvarozó felület).

## 2. Fázis: Felhasználói Funkciók (Webshop & Profil)

- [ ] **Termék Katalógus Refaktor**:
  - Külön `ProductList` és `CategoryFilter` komponensek.
  - Lapozás vagy infinite scroll implementálása (backend támogatás esetén).
- [ ] **Kosár és Megrendelés Flow**:
  - Kosár állapotkezelés (persistálás localStorage-ba).
  - Egyszerű checkout folyamat: Szállítási/számlázási adatok megerősítése -> Rendelés leadása.
- [ ] **Profil Teljes körű Kezelése**:
  - `Profile.tsx` bővítése: Jelszócsere, szállítási címek (CRUD).
  - Korábbi rendelések listája és státuszának megtekintése.

## 3. Fázis: Szerepkör-alapú Dashboardok (Manager Funkciók)

- [x] **Admin Felület**:
  - Statisztikai dashboard (Összes eladás, alacsony készlet figyelmeztetés).
  - Felhasználókezelés: Szerepkörök állítása, felhasználók tiltása.
  - Termék- és kategória szerkesztő (Modálok vagy külön oldalak).
- [x] **Megrendelés Kezelés**:
  - Központi lista szűrési lehetőségekkel (státusz, dátum, vásárló).
  - Státuszváltó workflow (pl. "Feldolgozás alatt" -> "Raktározás" -> "Szállítás alatt").
- [x] **Raktár Kezelés (Warehouseman/Admin)**:
  - Tárolóhelyek listája és vizualizációja.
  - Bevételezés/Kiadás űrlapok (Cikkszám és mennyiség megadása).
  - Készletmozgás napló megtekintése.

## 4. Fázis: Speciális Modulok és Finomhangolás

- [ ] **Reklamáció Kezelés**:
  - Felhasználói oldal: Új reklamáció beküldése képfeltöltéssel (ha támogatott).
  - Admin oldal: Reklamációk elbírálása és lezárása.
- [ ] **Fuvarozó (Carrier) Felület**:
  - Napi fuvarfeladatok listája.
  - Kiszállítás megerősítése gomb.
- [ ] **UI/UX Polishing**:
  - Loading skeletonok az adatbetöltés alatt.
  - Toast értesítések sikeres műveletekről/hibákról.
  - Mobil-optimalizálás (Responsive design) finomhangolása.

## Műszaki Irányelvek

1.  **TypeScript**: Szigorú típusozás minden API válaszhoz és komponens prop-hoz.
2.  **CSS**: Maradunk a Vanilla CSS-nél (vagy CSS Modules-nál), tartva a nemrég frissített fehér-sötétkék-szürke színvilágot.
3.  **Hiba kezelés**: Minden API hívásnál legyen felhasználóbarát hibaüzenet.

---

> [!NOTE]
> Az implementációt javasolt a **1. Fázis: Routing és AuthContext** megvalósításával kezdeni, mert erre épül az összes többi funkció.
