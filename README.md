# ZIA Clinic Backend

Separate backend for ZIA homeopathic clinic. MongoDB + Express.

## Run

```bash
npm install
npm start
```

Server: http://localhost:5000

## Deploy (Vercel)

1. Push to GitHub, connect repo to Vercel
2. Set **Root Directory** to `zia-backend` (if deploying from monorepo)
3. Add **MONGODB_URI** in Project → Settings → Environment Variables
4. Deploy

## Endpoints

- GET  /api/appointments
- POST /api/appointments
- GET  /api/appointments/:id
- PATCH /api/appointments/:id
- DELETE /api/appointments/:id
- GET  /api/appointments/date/:date
- GET  /api/payments
- POST /api/payments
- GET  /api/payments/:id
- PATCH /api/payments/:id
- DELETE /api/payments/:id
