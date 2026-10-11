# ResolveDesk Client

React/TanStack Start frontend for ResolveDesk.

From the repo root, `bun run dev` starts both the client and server.

## Run Locally

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

The dev server listens on `0.0.0.0` so it also works inside Docker.

## Environment

Copy the example:

```bash
cp .env.example .env
```

```bash
VITE_API_BASE_URL=http://localhost:5051
```

`VITE_` variables are visible in the browser. Do not put secrets in them.

## Docker

Build the image:

```bash
bun run docker:build
```

Run the image:

```bash
bun run docker:run
```

Run with live source code mounted:

```bash
docker run -d -p 5007:3000 -v "${PWD}:/app" -v /app/node_modules resolvedesk-app-client
```

Open `http://localhost:5007`.

## Scripts

```bash
bun run dev
bun run build
bun run lint
bun run format
bun run check
bun run docker:build
bun run docker:run
```

## Client tests

Run these commands from `client/` with dependencies already installed:

```bash
bun run test:run --maxWorkers 1
bun run test:coverage --maxWorkers 1
```

Vitest uses jsdom, React Testing Library, and the existing MSW setup to exercise service contracts, auth sessions, comment interactions, and queue pagination. The default suite excludes live checks and rejects unhandled mock requests. Use the normal Node-based Vitest runner through these scripts; do not add Bun's `--bun` runtime override for jsdom.

### Live client service checks

First run the [development seed](../server/README.md#development-seed) and start the local API. Store its private password in the ignored `client/.env.test.local`:

```dotenv
RESOLVEDESK_TEST_PASSWORD=<same private password used by the seed>
VITE_API_BASE_URL=http://localhost:5051
```

Never prefix the password with `VITE_`: those values are exposed to the application bundle. The password can also come from the shell environment. It is loaded only by the live test configuration.

```bash
bun run test:live
```

These checks call the real client service functions against a local API, without MSW or a server test runner. The configuration refuses remote API hosts. It verifies each seeded role, customer ownership, ticket creation, comments, assignment, status history, suggestions, article publication, refresh rotation, registration, and logout.

Each run adds an isolated ticket, comment, article, and registered customer using `[ResolveDesk smoke <run id>]` or `smoke.<run id>@example.test`. It preserves existing data and performs no cleanup deletion. Keep this workflow on a development database. Seed ticket counts remain deterministic because live fixtures use a different marker.

See [the verification record](service-qa.md) for actual results, fixes, and remaining limits.

## Application stack

- React
- TanStack Start and Router
- Tailwind CSS
- Bun
