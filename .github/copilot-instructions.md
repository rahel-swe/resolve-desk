# Copilot instructions for ResolveDesk

## Project overview

ResolveDesk is an ASP.NET Core Web API targeting .NET 10. The application is an AI-assisted support portal: users authenticate with JWT access tokens and refresh tokens, create and update support tickets, add comments, and request deterministic AI suggestions for priority, response text, and categorization. PostgreSQL is accessed through Entity Framework Core and Npgsql.

The intended business direction is documented in `RESOLVEDESK_PROJECT_PLAN.md`. It prioritizes authorized support workflows, SQL correctness, tests, CI/deployment, and measured AI drafts; do not assume planned endpoints exist until they are wired into the application.

## Build, run, and test

Run commands from the repository root:

```powershell
dotnet restore
dotnet build .\ResolveDesk.csproj
dotnet run --project .\ResolveDesk.csproj
dotnet watch --project .\ResolveDesk.csproj run
dotnet publish .\ResolveDesk.csproj
```

The VS Code tasks `build`, `publish`, and `watch` in `.vscode/tasks.json` invoke the same project commands. `.vscode/launch.json` starts the Development environment and launches the built `bin/Debug/net10.0/ResolveDesk.dll`.

There is currently no test project or test suite in the repository, so there is no project-specific full-suite or single-test command yet. For a future .NET test project, run one test with:

```powershell
dotnet test .\path\to\TestProject.csproj --filter "FullyQualifiedName~Namespace.ClassName.TestName"
```

Entity Framework CLI is pinned in `dotnet-tools.json`:

```powershell
dotnet tool restore
dotnet ef migrations add <MigrationName> --project .\ResolveDesk.csproj
dotnet ef database update --project .\ResolveDesk.csproj
```

Set `ConnectionStrings:DefaultConnection` for a PostgreSQL database before running migrations or the application. Keep local secrets out of tracked `appsettings*.json`; use .NET user secrets or another local configuration source.

## Architecture and request flow

- `Program.cs` is the composition root. It registers controllers, scoped service/repository implementations, JWT bearer authentication, authorization policies, OpenAPI, PostgreSQL `AppDbContext`, and the global exception handler.
- Controllers under `Controllers/` are thin HTTP adapters. They bind DTOs, read authenticated user IDs from `ClaimTypes.NameIdentifier`, call services, and return HTTP results. Ticket and comment endpoints share the `api/tickets` route.
- Services under `Services/` contain business behavior and map entities to response DTOs. Use the interfaces for dependency injection. `TicketAIService` is currently an in-process keyword/rule engine, not an external model integration.
- Repositories under `Repositories/` own EF Core queries and persistence. Ticket reads explicitly include `User` and `AssignedAgent` and order collections newest-first; preserve required eager-loading when changing those queries.
- `Data/AppDbContext.cs` exposes `DbSet`s for users, refresh tokens, tickets, comments, and knowledge articles. Schema changes are represented by the tracked `Migrations/` files.
- `Models/` are persistence/domain entities; `Dtos/` are API request/response shapes. Do not expose entity types from new API endpoints when a DTO is appropriate.
- `Middleware/GlobalExceptionHandler.cs` converts `NotFoundException` and `ConflictException` to problem-details responses (404/409) and logs unexpected failures as 500s with a trace ID.

## Conventions specific to this codebase

- Use file-scoped namespaces and nullable reference types. Existing code favors C# primary constructors for controllers, services, repositories, and `AppDbContext`.
- Register new service/repository pairs in `Program.cs` with `AddScoped`, and add interfaces before implementations when extending a layer.
- Keep controller authorization explicit. Existing policies are `AdminOnly` (requires the `Admin` role) and `AdminOrUser` (requires authentication); authentication runs before authorization in the pipeline.
- Access-token claims use `ClaimTypes.NameIdentifier`, `ClaimTypes.Email`, and `ClaimTypes.Role`. Preserve these claim types when changing auth flows.
- Normalize user-entered ticket fields in the service layer (current ticket creation trims title, description, and category). Store timestamps as UTC using `DateTime.UtcNow`.
- Use `TicketPriority` and `TicketStatus` from `Enums/TicketEnums.cs` rather than introducing string status/priority values. Their current EF representation is integer-backed.
- Services signal expected business failures by throwing `NotFoundException` or `ConflictException`; let the global handler format the response instead of duplicating error payloads in every controller.
- Repository methods are asynchronous EF Core operations and generally save changes inside the repository. Preserve `Include`, filtering, and ordering semantics when refactoring queries.
- Refresh tokens are generated randomly, stored only as SHA-256 hashes, expire after seven days, and are revoked on rotation/logout. Never persist or log the raw refresh token.
- AI suggestion logic lowercases combined title/description/category text and uses ordered keyword checks. When adding rules, keep matching deterministic and update the returned rationale/steps together with the classification.
- Add and update EF migrations when changing persisted models or relationships; do not edit the model snapshot or generated migration designer by hand unless the EF workflow requires it.
- `.gitignore` excludes build output (`bin/`, `obj/`), local secrets, and the project planning document. Avoid committing generated build artifacts or credentials.
