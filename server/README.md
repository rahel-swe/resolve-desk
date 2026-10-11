# ResolveDesk Server

ASP.NET Core backend for ResolveDesk.

## Run Locally

```bash
dotnet restore
dotnet watch run --launch-profile http
```

The API runs at `http://localhost:5051` and restarts when server files change.

## Configuration

For direct ASP.NET Core runs, use .NET user secrets or machine environment variables.

Required server values:

```bash
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://localhost:5051
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=resolvedesk;Username=rahel;Password=change-this-local-postgres-password
Jwt__Key=replace-with-a-long-local-development-secret-at-least-32-characters
Jwt__Issuer=ResolveDesk
Jwt__Audience=ResolveDeskClient
```

ASP.NET Core maps double underscores to configuration sections:

```text
ConnectionStrings:DefaultConnection
Jwt:Key
Jwt:Issuer
Jwt:Audience
```

For Docker Compose, set the root `.env` file. Compose passes those values into the server container as environment variables.

In Compose the same setting is kept as one value:

```text
DATABASE_CONNECTION_STRING=Host=db;Port=5432;Database=resolvedesk;Username=rahel;Password=resolvedesk-local-password
```

Keep real secrets out of committed files.

## Database

This project uses PostgreSQL with EF Core migrations.

```bash
dotnet tool restore
dotnet ef database update
```

From the repo root:

```bash
bun run db:migrate
```

## Docker

Build the server image from the repo root:

```bash
docker build -t resolvedesk-app-server ./server
```

Run the full Docker stack from the repo root:

```bash
cp .env.example .env
bun run docker:migrate
bun run docker:up
```

## Development seed

Creates 5 accounts across Admin, SupportAgent, and Customer, 72 tickets with comments/history, and 1 knowledge article.

Add your seed password to the root `.env` (this file is ignored by Git):

```dotenv
DevelopmentSeed__Password=your-private-seed-password
```

Then run from the repository root:

```bash
bun run db:seed
```

Use 16–72 ASCII characters. [Bun reads `.env` automatically](https://bun.sh/docs/runtime/environment-variables), and all accounts below use this password. If you already seeded, reuse the same password.

| Email | Role |
| --- | --- |
| seed.admin@example.test | Admin |
| seed.agent@example.test | SupportAgent |
| seed.agent-other@example.test | SupportAgent |
| seed.customer@example.test | Customer |
| seed.customer-other@example.test | Customer |

Uses your configured database in Development. Apply migrations first. Reruns preserve existing accounts and ticket edits; conflicting accounts cause an error.

Fresh seeds give the customers 40 and 32 tickets. Older `seed.user` accounts and their tickets are preserved, but no new `User` account is created.

For [live client checks](../client/README.md#live-client-service-checks), use the same password in ignored `client/.env.test.local`. Keep passwords out of commits.

## Server tests

```bash
dotnet test
```

From the repo root:

```bash
bun run check
```

## Structure

```text
Api/             Controllers and HTTP helpers
Application/     DTOs, services, rules, and use cases
Domain/          Entities and enums
Infrastructure/  EF Core, repositories, and database setup
Middleware/      Central error handling
Tests/           Unit tests
```

## Focus

- JWT authentication
- Ticket ownership and permissions
- Status rules and history
- Knowledge article management
- Human-approved AI suggestions
