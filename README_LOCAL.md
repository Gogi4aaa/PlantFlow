# Стартиране на PlantFlow локално

## Изисквания
- Node.js 20+
- npm

---

## 1. Стартиране на backend

```bash
cd PlantFlow/server
npm install
npm run dev
```

Сървърът се стартира на **http://localhost:3001**

---

## 2. Стартиране на frontend

```bash
cd PlantFlow
npm install
npm run dev
```

Приложението се отваря на **http://localhost:5173**

---

## Бележки

- Файлът `PlantFlow/.env.local` насочва frontend-а към локалния backend (не към продукцията).
- База данни и MQTT брокер са в облака (Supabase + HiveMQ) — не се налага локална инсталация.
- За продукция се използва `npm run build` и `.env.production` — `.env.local` не влияе на build-а.
