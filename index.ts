import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

type DevService = {
  name: string;
  command: string;
  args: string[];
  cwd?: string;
};

const isWindows = process.platform === "win32";

const devServices: DevService[] = [
  {
    name: "server",
    command: "dotnet",
    args: [
      "watch",
      "--project",
      "server/ResolveDesk.csproj",
      "run",
      "--launch-profile",
      "http",
    ],
  },
  {
    name: "client",
    command: "bun",
    args: ["run", "dev"],
    cwd: "client",
  },
];

const runningServices: ReturnType<typeof spawn>[] = [];
let shuttingDown = false;

function streamServiceLogs(serviceName: string, stream: Readable) {
  const lines = createInterface({ input: stream });

  lines.on("line", (line) => {
    console.log(`[${serviceName}] ${line}`);
  });
}

function stopAllServices(exitCode = 0) {
  if (shuttingDown) return;

  shuttingDown = true;

  for (const service of runningServices) {
    if (!service.killed) service.kill();
  }

  process.exitCode = exitCode;
}

function startService(service: DevService) {
  const runningService = spawn(service.command, service.args, {
    cwd: service.cwd,
    shell: isWindows,
    stdio: ["inherit", "pipe", "pipe"],
  });

  runningServices.push(runningService);

  if (runningService.stdout) {
    streamServiceLogs(service.name, runningService.stdout);
  }

  if (runningService.stderr) {
    streamServiceLogs(service.name, runningService.stderr);
  }

  runningService.on("exit", (code) => {
    if (!shuttingDown) {
      stopAllServices(code ?? 1);
    }
  });
}

function seedDevelopment() {
  const password = process.env.DevelopmentSeed__Password;

  if (
    !password?.trim() ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    console.error(
      "Set DevelopmentSeed__Password in the root .env (at least 8 characters, at most 72 UTF-8 bytes).",
    );

    process.exitCode = 1;
    return;
  }

  const seed = spawn(
    "dotnet",
    [
      "run",
      "--project",
      "server/ResolveDesk.csproj",
      "--configuration",
      "Release",
      "--no-launch-profile",
      "--",
      "--seed-development",
    ],
    {
      cwd: fileURLToPath(new URL(".", import.meta.url)),
      env: {
        ...process.env,
        ASPNETCORE_ENVIRONMENT: "Development",
        DOTNET_ENVIRONMENT: "Development",
      },
      stdio: "inherit",
      shell: false,
    },
  );

  seed.on("error", (error) => {
    console.error(`Could not start the development seed: ${error.message}`);
    process.exitCode = 1;
  });

  seed.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
  process.once("SIGINT", () => seed.kill("SIGINT"));
  process.once("SIGTERM", () => seed.kill("SIGTERM"));
}

const mode = process.argv[2] ?? "dev";

if (mode === "seed") {
  seedDevelopment();
} else if (mode === "dev") {
  for (const service of devServices) {
    startService(service);
  }
  process.on("SIGINT", () => stopAllServices(0));
  process.on("SIGTERM", () => stopAllServices(0));
} else {
  console.error("Usage: bun index.ts [dev|seed]");
  process.exitCode = 1;
}
