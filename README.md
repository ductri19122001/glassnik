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

API base URL: `http://localhost:3000`.

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

### Me (`/me`) — JWT required
- `GET /me/capabilities`

### GCP Test Upload
- `GET /test-upload` (uploads a small text file to GCS; requires valid GCP credentials)

## Notes
- `x-user-id` and `x-admin` headers are temporary/test-only.
- Don’t commit secrets: `.env` and service account JSON keys should remain untracked.
