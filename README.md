# Queer Speed Meet

A custom, responsive speed dating platform built with Next.js App Router.

## Project Structure

| Directory | Description |
|---|---|
| `/app` | Next.js App Router — Registrant UI, Admin UI, Event Feedback |
| `/app/api` | API routes — Auth, User Management, Matchmaking, Events |
| `/prisma` | PostgreSQL schema and migrations |
| `docker-compose.yml` | Full-stack deployment (PostgreSQL + app) |

---

## 💻 Local Development

### Prerequisites

- Node.js v20.9.0+
- Docker & Docker Compose

### 1. Configure Environment

```bash
cp .env.example .env
```

Fill in your `.env` — see `.env.example` for all available variables.

### 2. Start the Database

```bash
docker compose up -d db
```

> The database runs on port **5433** to avoid conflicts with a local PostgreSQL install.

### 3. Install Dependencies & Migrate

```bash
npm install
npx prisma migrate dev
```

### 4. Run the Dev Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). On first run you'll be prompted to create an admin user.

---

## 🧪 Testing

### Production Build Check

Verify the app compiles without type errors:

```bash
npm run build
```

### Full-Stack Docker Test

Run the entire stack locally (database + app) to validate the Docker image:

```bash
docker compose up --build
```

This builds the app image with the values in your `.env` and starts both the database and the app at [http://localhost:3000](http://localhost:3000).

---

## 🚀 Production Deployment

Deploy on any machine with Docker and Docker Compose installed.

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd qsm
cp .env.example .env
```

Edit `.env` with your production values:

- Set `POSTGRES_PASSWORD` to a strong random password
- Set `NEXTAUTH_SECRET` to a random secret (e.g. `openssl rand -base64 32`)
- Set `NEXTAUTH_URL` and `AUTH_URL` to your production domain
- Configure SMTP credentials for email
- Set `NEXT_PUBLIC_APP_NAME` to your event name

### 2. Start

```bash
docker compose up -d --build
```

The app will:

1. Build the Next.js production image (baking in `NEXT_PUBLIC_*` values)
2. Start PostgreSQL and wait for it to be healthy
3. Run Prisma migrations automatically
4. Start the app on port 3000

### 3. Updates

Pull the latest code and rebuild:

```bash
git pull
docker compose up -d --build
```

Migrations run automatically on each container start.
