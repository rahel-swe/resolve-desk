# ResolveDesk Server

ASP.NET Core backend for ResolveDesk.

## Run Locally

```bash
dotnet restore
dotnet watch run --launch-profile http
```

The API runs at `http://localhost:5051` and restarts when server files change.

## Configuration

Set these values for local development:

```text
ConnectionStrings:DefaultConnection
Jwt:Key
Jwt:Issuer
Jwt:Audience
```

Keep real secrets out of committed files. Use user secrets or environment variables.

## Database

This project uses PostgreSQL with EF Core migrations.

```bash
dotnet tool restore
dotnet ef database update
```

## Tests

```bash
dotnet test
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
