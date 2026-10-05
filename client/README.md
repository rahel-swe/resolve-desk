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

## Stack

- React
- TanStack Start and Router
- Tailwind CSS
- Bun
