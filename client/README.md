# ResolveDesk Client

React + TanStack Start, styled with Tailwind CSS and shadcn components. The dashboard highlights unassigned active requests; the ticket queue leads into conversations and ticket actions.

## Run locally

Commands below run from `client/`. You need Bun and the API at `http://localhost:5051`.

```bash
bun install
cp .env.example .env
bun run dev
```

Open `http://localhost:3000`. From the repo root, `bun run dev` starts both client and API.

Set `VITE_API_BASE_URL` in `.env` to change the API address. Vite settings reach the browser, so keep secrets out of `VITE_` variables.

## Everyday commands

```bash
bun run build
bun run lint
bun run check # Check formatting
bun run format # Rewrite formatting and apply lint fixes
```

## Tests

```bash
bun run test # Watch mode
bun run test:run --maxWorkers 1
bun run test:coverage --maxWorkers 1
```

Vitest, React Testing Library, jsdom, and MSW cover components and API services. `vitest.config.ts` uses mocked requests and excludes live tests. Run these scripts without the `--bun` override.

### Live client service checks

[Seed the database](../server/README.md#development-seed), start the local API, and add this to ignored `client/.env.test.local`:

```dotenv
RESOLVEDESK_TEST_PASSWORD=<same private password used by the seed>
VITE_API_BASE_URL=http://localhost:5051
```

```bash
bun run test:live
```

Uses `vitest.live.config.ts` to check real authentication, token refresh, ticket workflows, and knowledge articles. Only local API addresses are allowed. Each run adds marked records and a test account; use a development database.

## Docker

From `client/`, run `bun run docker:build`, then `bun run docker:run`. Open `http://localhost:3000`.

For the full stack, use the [root Docker commands](../README.md#run-with-docker).
