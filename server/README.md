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

## Tests

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
