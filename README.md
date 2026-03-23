# Glassnik Backend

Backend for the Glassnik system, built with NestJS + Prisma (PostgreSQL), with optional Google Cloud Storage integration.

## Quick Start

1) Install dependencies
```bash
npm install
```

2) Create `.env` (see **Environment** below)

3) Sync database schema
```bash
npx prisma migrate dev --name init
```

4) Run the server
```bash
npm run start:dev
```

The API runs at `http://localhost:3000`.

---

## User & Capabilities APIs (Current)

### Authentication (`/auth`)
Endpoints:
1. `POST /auth/register`
   Register a new user.
2. `POST /auth/login`
   Login with email/password. Returns `accessToken` and `refreshToken`.
3. `POST /auth/refresh`
   Refresh access token using refresh token.
4. `POST /auth/logout`
   Logout (revoke refresh token).

### User Management (`/users`)
Endpoints:
1. `POST /users`  
Register a new user.

## Environment

Create a `.env` file in the project root (it is ignored by git).

Required:
- `DATABASE_URL` (PostgreSQL connection string)

Optional:
- `PORT` (default `3000`)
- `JWT_SECRET` (default `glassnik-dev-secret`)
- `GOOGLE_APPLICATION_CREDENTIALS` (path to a GCP service account JSON key, e.g. `./my-key.json`)
- `GCP_BUCKET_NAME` (default `glassnik` for `/test-upload`, and `glassnik-videos` for video uploads)

## API Testing

Recommended: use `requests.http` (VS Code extension: "REST Client").
- Send `POST /auth/register`
- Send `POST /auth/login` and copy `access_token`
- Set `@JWT = <access_token>` at the top of `requests.http`
- Run the authenticated requests (e.g. `GET /videos`)

## Endpoints (Current)

### Auth (`/auth`)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Videos (`/videos`) — JWT required
- `POST /videos`
- `POST /videos/upload` (multipart file upload, field name: `file`)
- `GET /videos`
- `GET /videos/:id`
- `PATCH /videos/:id`
- `DELETE /videos/:id`

### Subscriptions (`/subscriptions`) — JWT required
- `POST /subscriptions` (body: `{ "planCode": "premium" }`)
- `GET /subscriptions/current`
- `POST /subscriptions/cancel`

### Applications (`/applications`) — JWT required
- `POST /applications`
- `GET /applications` (optional `?status=...`)
- `GET /applications/:id`
- `PATCH /applications/:id/review`

### Live (`/live`)
- `GET /live/:liveId` (public)
- `GET /live/:liveId/premium` (JWT + capability `live.subscriber`)
- `POST /live/start` (JWT + capability `live.creator`)
- `POST /live/:liveId/chat` (JWT + capability `live.viewer`)

### Mobile (`/mobile`)
- `GET /mobile/feed` (public; supports cursor pagination params)
- `POST /mobile/videos` (JWT + capability `mobile.creator`)

### Users (`/users`) — legacy test auth
These endpoints currently use the header `x-user-id` for local testing:
- `POST /users`
- `GET /users/me`
- `PATCH /users/me`
- `GET /users/:id`
- `GET /users/:userId/capabilities`

### Capabilities (`/capabilities`) — admin header for create
- `GET /capabilities`
- `POST /capabilities` (requires `x-admin: true`)

### Smart Glasses Experiences (`/glasses`)
Endpoints:
1. `GET /glasses/experiences/:id` - View immersive content (Requires `glasses.subscriber`).
2. `POST /glasses/footage` - Upload footage (Requires `immersive.contributor`).

### Core (`/me`)
*Note: Currently using `GET /users/me` or `GET /users/:id/capabilities` to retrieve capabilities.*

---

## Testing Guide (PowerShell)

Important: In PowerShell, `curl` is an alias for `Invoke-WebRequest`.  
Use `Invoke-RestMethod` or `curl.exe`.

### 1) Create a user
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/users `
  -ContentType "application/json" `
  -Body '{"email":"alice@example.com","username":"alice","displayName":"Alice"}'
```

### 2) Get current user profile
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/users/me `
  -Headers @{ "x-user-id" = "1" }
```

### 3) Update current user profile
```powershell
Invoke-RestMethod -Method Patch -Uri http://localhost:3000/users/me `
  -Headers @{ "x-user-id" = "1" } `
  -ContentType "application/json" `
  -Body '{"displayName":"Alice Updated","avatarUrl":"https://example.com/a.png"}'
```

### 4) Get public profile
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/users/1
```

### 5) Create capability (admin)
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/capabilities `
  -Headers @{ "x-admin" = "true" } `
  -ContentType "application/json" `
  -Body '{"name":"Top Supporter","badgeType":"SUBSCRIPTION","minAmount":10,"minMonths":3}'
```

### 6) List capabilities
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/capabilities
```

### 7) List a user's capabilities
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/users/1/capabilities
```

---

## Testing Guide (curl.exe on Windows)

```powershell
curl.exe -X POST http://localhost:3000/users `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"alice@example.com\",\"username\":\"alice\",\"displayName\":\"Alice\"}"
```

### GCP Test Upload
- `GET /test-upload` (uploads a small text file to GCS; requires valid GCP credentials)

## Notes
- `x-user-id` and `x-admin` are **temporary headers** for local testing only.
- Real authentication and authorization (JWT/guards/roles) can be added later.

