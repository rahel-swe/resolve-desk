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

From the repository root, supply `DevelopmentSeed__Password` privately, then run:

```powershell
./scripts/seed-development.ps1
```

The password must contain at least 16 characters and fit within 72 UTF-8 bytes. There is no default. The helper requires the shell environment variable. Direct invocation can also read .NET user secrets (`DevelopmentSeed:Password`). Do not commit the password. All six sample accounts use it, hashed with BCrypt at work factor 12.

| Email | Role | Seed ticket ownership |
| --- | --- | --- |
| seed.admin@example.test | Admin | None |
| seed.agent@example.test | SupportAgent | Assigned sample tickets |
| seed.agent-other@example.test | SupportAgent | Assigned sample tickets |
| seed.customer@example.test | Customer | 40 tickets |
| seed.customer-other@example.test | Customer | 24 tickets |
| seed.user@example.test | User | 8 tickets; legacy customer behavior |

The seed adds 72 tickets across all statuses and priorities, assigned and unassigned requests, comments, valid status histories, and one knowledge article. Titles start with `[ResolveDesk seed v1]`. This exceeds the API page size of 50 and the client's visible page size of 10.

The command uses the existing connection settings and user-secrets ID. Apply pending migrations separately first. Normal API startup never seeds. Direct invocation is also supported in the Development environment:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project server/ResolveDesk.csproj --configuration Release --no-launch-profile -- --seed-development
```

The flag is rejected outside Development. The PowerShell helper temporarily selects Development and restores the previous environment afterward. It compiles Release separately from a running Debug server; stop a running Release server before rebuilding its executable.

Repeated runs add only missing marked samples and preserve existing ticket edits, passwords, and roles. An account with a reserved email but a different name, role, or password causes the seed to fail rather than reset or promote it. Keep the same private password for subsequent runs. Existing marked articles owned by another account also cause a failure.

Seed row writes share one transaction. An advisory lock serializes seed runs; table write locks briefly pause other writers while identity sequences are advanced past imported IDs. Sequence advancement can leave harmless ID gaps even if row writes roll back. No existing rows are deleted and no schema changes run automatically. The seed may repair missing author metadata only on its own marked article.

For the live client checks, put the same password in the ignored `client/.env.test.local` as `RESOLVEDESK_TEST_PASSWORD`. See [client test instructions](../client/README.md#client-tests).

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
