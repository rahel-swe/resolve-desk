import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";

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

for (const service of devServices) {
  startService(service);
}

process.on("SIGINT", () => stopAllServices(0));
process.on("SIGTERM", () => stopAllServices(0));
