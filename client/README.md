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

From `client/`:

```bash
bun run test:run --maxWorkers 1
bun run test:coverage --maxWorkers 1
```

Uses Vitest, React Testing Library, jsdom, and MSW. Run the scripts without the `--bun` runtime override.

### Live client service checks

Run the [seed](../server/README.md#development-seed), start the local API, and set the same password in ignored `client/.env.test.local`:

```dotenv
RESOLVEDESK_TEST_PASSWORD=<same private password used by the seed>
VITE_API_BASE_URL=http://localhost:5051
```

```bash
bun run test:live
```

Checks the real client services against the local API. Each run adds marked test records and preserves existing data. Keep the password file uncommitted.

See [test results](service-qa.md).

## Application stack

- React
- TanStack Start and Router
- Tailwind CSS
- Bun
