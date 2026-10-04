# ResolveDesk

ResolveDesk is an AI-assisted support desk for learning and building practical full-stack engineering skills.

Customers create tickets, support agents manage the queue, and admins control assignments and knowledge articles. AI can help draft replies, but people stay in control.

## Project Layout

```text
client/  React/TanStack frontend
server/  ASP.NET Core backend
```

## Client

Run the full app from the repo root:

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

Docker:

```bash
cd client
docker build -t react-app .
docker run -d -p 3000:3000 --name c1 react-app
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
