Glassnik Backend

Backend project for the Glassnik system, built with NestJS, Prisma (PostgreSQL), and integrated with Google Cloud Platform.

🛠 Prerequisites

Node.js (v18 or later)

PostgreSQL (v14 or later)

Google Cloud Platform account (with a Service Account Key)

🚀 Installation and Running
1. Install dependencies
npm install

2. Environment Configuration

Copy the .env.example file to .env:

cp .env.example .env


Update the DATABASE_URL in the .env file to connect to your local PostgreSQL database.

3. Google Cloud Configuration (Important)

This project requires a Service Account Key file to upload files to Google Cloud Storage.

Download the JSON Key file from the Google Cloud Console.

Rename the file to glassnik-7d5600b7230e.json
(or update the filename in src/gcp.service.ts).

Place this file in the project root directory (same level as package.json).

Note: This file is already added to .gitignore. Never commit it to Git.

4. Database

The project uses Prisma. To sync the schema to the database:

# Create a migration and apply it to the database
npx prisma migrate dev --name init

# Or only generate Prisma Client (if the database already exists)
npx prisma generate

5. Run the Server
# Run in development mode (watch mode)
npm run start:dev


The server will be running at:
http://localhost:3000

📚 API Documentation

Currently, the project includes the following test endpoints:

GET /: Health check.

GET /test-upload: Test uploading a text file to the Google Cloud Storage bucket glassnik.

📁 Main Directory Structure

src/gcp.service.ts: Service handling file upload logic to Google Cloud Platform.

dbschema.txt: File describing the original database design (for reference).