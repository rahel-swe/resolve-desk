# ResolveDesk

ResolveDesk is an AI-assisted support desk for learning and building practical full-stack engineering skills.

Customers create tickets, support agents manage the queue, and admins control assignments and knowledge articles. AI can help draft replies, but people stay in control.

## Project Layout

```text
client/  React/TanStack frontend
server/  ASP.NET Core backend
```

## Commands

Run these from the repo root.

```bash
bun run setup
bun run dev
bun run build
bun run check
bun run db:migrate
bun run docker:migrate
bun run docker:up
bun run docker:down
```

## Environment

Root `.env` is for Docker Compose. It should stay small:

```text
DATABASE_CONNECTION_STRING  one PostgreSQL connection string for the API
RESOLVEDESK_JWT_KEY         local JWT signing key
CLIENT_API_BASE_URL         browser API URL
```

```bash
cp .env.example .env
```

Client `.env` is for Vite when running the client directly:

```bash
cp client/.env.example client/.env
```

Server secrets should be set with .NET user secrets, machine environment variables, Docker Compose variables, or deployment secrets. `server/.env.example` is only a reference for ASP.NET Core environment variable names.

Keep real secrets out of committed files.

## Development

Run the full app:

```bash
bun run dev
```

This starts the API with `dotnet watch` on `http://localhost:5051` and the client on `http://localhost:3000`.

Run only the client:

```bash
cd client
bun install
bun run dev
```

Open `http://localhost:3000`.

For client-only Docker commands, use `client/package.json`.

## Docker Compose

The root `compose.yml` runs these named containers:

```text
resolvedesk-app-db      PostgreSQL
resolvedesk-app-server  ASP.NET Core API
resolvedesk-app-client  React/TanStack frontend
```

First copy the root env example:

```bash
cp .env.example .env
```

For Compose, the database connection string uses the Docker service name `db`:

```text
Host=db;Port=5432;Database=resolvedesk;Username=rahel;Password=resolvedesk-local-password
```

Then run the database migration:

```bash
bun run docker:migrate
```

Start the full stack:

```bash
bun run docker:up
```

Open:

```text
client  http://localhost:3000
server  http://localhost:5051
```

## Server

The backend is in `server/` and uses ASP.NET Core, EF Core, PostgreSQL, JWT authentication, tickets, comments, and knowledge articles.

See `server/README.md` for local setup, database commands, tests, and structure.

## Engineering Focus

- Clear HTTP contracts
- Resource authorization
- Reliable data changes
- Practical Docker usage
- Human-approved AI workflows
