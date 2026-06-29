// Run a Next.js command with variables from a specific .env file loaded into
// process.env. Used by the per-environment scripts (uat / beta / production).
//
// Why a wrapper instead of `node --env-file=...`:
//   Next 16 (Turbopack) copies the parent's execArgv into worker NODE_OPTIONS,
//   and `--env-file` is rejected there (ERR_WORKER_INVALID_EXEC_ARGV). So we
//   load the file into process.env here, then spawn `next` as a plain child
//   that simply inherits the environment.
//
// Usage: node scripts/with-env.mjs <env-file> <next-subcommand> [args...]
import { spawnSync } from "node:child_process";

const [envFile, ...nextArgs] = process.argv.slice(2);

if (!envFile || nextArgs.length === 0) {
  console.error("Usage: node scripts/with-env.mjs <env-file> <next-subcommand> [args...]");
  process.exit(1);
}

// Populate process.env from the env file. Keys already present in the
// environment win, matching Node's --env-file precedence.
process.loadEnvFile(envFile);

const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", ...nextArgs],
  { stdio: "inherit", env: process.env }
);

process.exit(result.status ?? 1);
