# ResolveDesk

A support desk that turns incoming requests into a clear queue: customers raise tickets, agents resolve them, and admins manage assignments and knowledge articles.

Built with React, TanStack Start, ASP.NET Core 10, EF Core, and PostgreSQL.

## Start locally

You need Bun, the .NET 10 SDK, and a running PostgreSQL database. Run from the repo root:

```bash
bun run setup
```

Setup copies `server/appsettings.example.json` to ignored `server/appsettings.json`. **After setup, edit `appsettings.json` with your real PostgreSQL connection string and JWT signing key.** See [server configuration](server/README.md#configuration) for manual copying and field names.

Setup also attempts migrations. If that step fails with the example settings, fill in your real values, then continue:

```bash
bun run db:update
bun run dev
```

Open the [client](http://localhost:3000). The API runs at `http://localhost:5051`.

`setup` installs dependencies and overwrites `client/.env` and `server/appsettings.json` with their examples. Back up local edits before rerunning it.

## Everyday commands

Run from the repo root:

```bash
bun run setup:client # Install client dependencies and copy its .env example
bun run setup:server # Restore .NET tools/packages, copy config, update database
bun run db:update # Apply database migrations
bun run db:seed # Add development sample data; see server docs
bun run build # Build client and server
bun run check # Check client formatting and run server tests
```

Client tests run separately; see the [client guide](client/README.md#tests).

## Run with Docker

Copy `.env.example` to `.env` and set your local JWT key. Keep `Host=db` in the database connection string; the browser API URL stays `http://localhost:5051`.

```bash
bun run docker:migrate
bun run docker:up
```

Compose runs `db`, `server`, and `client`, using the same browser URLs as local development. Run `bun run docker:down` to stop them; database data stays in its named volume.

## Find your way

- [Client](client/README.md): dashboard, ticket queue, conversations, and tests.
- [Server](server/README.md): configuration, migrations, seed accounts, and backend structure.

Local API settings live in ignored `server/appsettings.json`; its committed example is the template. Root `.env` supplies Compose values and the optional seed password. Client `.env` supplies public Vite settings.
