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

## API Endpoints

### User Management (`/users`)
- `POST /users` - Register a new user.
- `GET /users` - List all users.
- `GET /users/:id` - Get user details.
- `GET /users/:id/capabilities` - List capabilities assigned to a user.

### Capabilities (`/capabilities`)
- `GET /capabilities` - List all capability definitions.
- `POST /capabilities` - Create a new capability (Admin only, header `x-admin: true`).

### Applications (`/applications`)
- `POST /applications` - Submit a capability application (Header `x-user-id`).
- `GET /applications` - List applications (Admin only, header `x-admin: true`).
- `GET /applications/:id` - Get application details.
- `PATCH /applications/:id/review` - Approve/Reject application (Admin only).

---

## Testing Guide (Command Prompt / cmd.exe)

**Note**: Use `^` for line continuation in Command Prompt.

### 1. Create a User
```cmd
curl -X POST http://localhost:3000/users ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"username\":\"tester\",\"displayName\":\"Test User\"}"
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

### 8) Create "Admin" Capability (Admin only)
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/capabilities `
  -Headers @{ "x-admin" = "true" } `
  -ContentType "application/json" `
  -Body '{"name":"Admin Role","badgeType":"SUBSCRIPTION","minAmount":0,"minMonths":0,"iconUrl":"https://placehold.co/64"}'
```

### 9) Assign Capability to User 2 (Admin only)
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/users/2/capabilities `
  -Headers @{ "x-admin" = "true" } `
  -ContentType "application/json" `
  -Body '{"capabilityId":2}'
```


## Testing Guide (Command Prompt / cmd.exe)

**Note**: Use `^` for line continuation in Command Prompt.

### 1) Create a user
```cmd
curl -X POST http://localhost:3000/users ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"alice@example.com\",\"username\":\"alice\",\"displayName\":\"Alice\"}"
```

---

## Notes
- `x-user-id` and `x-admin` are **temporary headers** for local testing only.
- Real authentication and authorization (JWT/guards/roles) can be added later.
