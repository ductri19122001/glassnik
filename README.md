# Glassnik Backend

Backend project built with NestJS, Prisma (PostgreSQL), and Google Cloud Storage.

**Quick setup**
1. Install dependencies
```bash
npm install
```

2. Create `.env` from the example
```bash
copy src\.env.example .env
```

3. Update `DATABASE_URL` in `.env` to point to your local PostgreSQL instance.

4. (Optional) Google Cloud Storage setup  
If you plan to call the `/test-upload` endpoint from `AppController`, place your GCP service account JSON in the project root and set:
`GOOGLE_APPLICATION_CREDENTIALS=./<your-key>.json`

5. Sync database schema
```bash
npx prisma migrate dev --name init
```

6. Run the server
```bash
npm run start:dev
```

The API runs at `http://localhost:3000`.

---

## User & Capabilities APIs (Current)

### User Management (`/users`)
Endpoints:
1. `POST /users`  
Register a new user.

2. `GET /users/me`  
Get the current user profile.  
Uses header `x-user-id` for now (simple test auth).

3. `PATCH /users/me`  
Update current user profile (display name, avatar).  
Uses header `x-user-id`.

4. `GET /users/:id`  
Get public profile information of another user.

5. `GET /users/:userId/capabilities`  
List capabilities assigned to a specific user.

### Capabilities & Badges (`/capabilities`)
Endpoints:
1. `GET /capabilities`  
List all available capability definitions.

2. `POST /capabilities` (Admin only)  
Create a new capability definition.  
Uses header `x-admin: true`.

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

---

## Notes
- `x-user-id` and `x-admin` are **temporary headers** for local testing only.
- Real authentication and authorization (JWT/guards/roles) can be added later.
