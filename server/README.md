# ResolveDesk Server

ASP.NET Core 10 API with EF Core, PostgreSQL, JWT authentication, and refresh tokens. Handles tickets, comments, assignments, status history, and knowledge articles.

Commands below run from the repo root unless a section says otherwise.

## Configuration

`bun run setup` and `bun run setup:server` copy `server/appsettings.example.json` to `server/appsettings.json`. To copy it manually:

```bash
cp server/appsettings.example.json server/appsettings.json
```

**After setup, edit `server/appsettings.json` with your real local values:**

- `ConnectionStrings.DefaultConnection`: your PostgreSQL connection string, using `Host=localhost` for a local database.
- `Jwt.Key`: your private signing key, at least 32 characters.

Keep `Jwt.Issuer` as `ResolveDesk` and `Jwt.Audience` as `ResolveDeskClient`. `appsettings.json` is ignored by Git; commit only the example with placeholder values. The server no longer uses a `.env.example` file.

Existing .NET user secrets or environment variables can override these settings.

## Run locally

```bash
bun run setup:server
```

Restores packages/tools, overwrites `server/appsettings.json` with the example, and attempts migrations. Edit the copied file as described above. If setup stops at the database step, correct the settings and continue below; rerunning setup would overwrite your edits.

```bash
bun run db:update
dotnet watch --project server/ResolveDesk.csproj run --launch-profile http
```

The API listens at `http://localhost:5051`. Use `bun run dev` to start the client too.

## Database

Apply existing migrations:

```bash
bun run db:update
```

After changing the EF model, create a migration, review it, then apply it:

```bash
dotnet ef migrations add NameOfMigration --project server
bun run db:update
```

For Docker, follow the [root guide](../README.md#run-with-docker). Compose passes server settings from root `.env`; its database host is `db`.

## Development seed

In the ignored `server/appsettings.json`, set a private seed password beside `ConnectionStrings`:

```json
"DevelopmentSeed": {
  "Password": "<your-private-seed-password>"
}
```

Use at least 8 characters and at most 72 UTF-8 bytes. Then update and seed from the `server` directory:

```powershell
cd server
dotnet ef database update
dotnet run -c Release -- --seed-development
```

The default `http` launch profile sets the Development environment; `-c Release` keeps the seed build separate from a running Debug server. The seed exits without starting the API. Environment variables and .NET user secrets can override the password in `appsettings.json`.

To seed from the repo root instead, set `DevelopmentSeed__Password` in the ignored root `.env` and run `bun run db:seed`. Direct `dotnet run` does not load the root `.env`.

Creates 5 accounts, 72 tickets with comments/history, and 1 knowledge article in your configured development database. All seed accounts use the same password:

- Admin: `seed.admin@example.test`
- Staff: `seed.staff@example.test`, `seed.staff-other@example.test`
- Customer: `seed.customer@example.test`, `seed.customer-other@example.test`

Fresh seeds assign 40 tickets to the first customer and 32 to the second. Reruns preserve existing accounts and ticket edits; reuse the same password. Conflicting accounts stop the seed.

Use the same password for [live client checks](../client/README.md#live-client-service-checks).

## Tests and structure

```bash
dotnet test server/Tests/ResolveDesk.Tests.csproj
```

Requests flow through `Api/` controllers, `Application/` services, and `Infrastructure/` repositories into PostgreSQL. `Domain/` holds entities/enums, `Middleware/` handles errors, and `Tests/` holds unit tests.
