#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadManifest, validateKovBundle } from "./kovMetadataUpgradeLib.mjs";

function parseArgs(argv) {
  const args = { root: "KOV", manifest: "config/kov-metadata-upgrade-manifest.json" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--manifest") args.manifest = argv[++index];
    else if (arg === "--root") args.root = argv[++index] || args.root;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return args;
}

function usage() {
  return "Usage: npm run kov:validate-metadata -- --manifest config/kov-metadata-upgrade-manifest.json";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  const manifest = loadManifest(args.manifest);
  const excluded = new Set(manifest.excluded_slugs || []);
  const entries = manifest.municipalities.filter(entry => !excluded.has(entry.slug));
  const results = entries.map(entry => validateKovBundle(entry, { root: args.root }));
  const harkuBackupPattern = path.join(args.root, "harku-vald");
  const harkuBackupFiles = fs.existsSync(harkuBackupPattern)
    ? fs.readdirSync(harkuBackupPattern).filter(name => name.includes(".bak-"))
    : [];
  const harkuUnchanged = !entries.some(entry => entry.slug === "harku-vald") && harkuBackupFiles.length === 0;
  const ok = results.every(result => result.ok) && harkuUnchanged;
  console.log(JSON.stringify({
    ok,
    checked: results.length,
    harkuUnchanged,
    harkuBackupFiles,
    results
  }, null, 2));
  if (!ok) process.exitCode = 1;
}

main().catch(error => {
  console.error(`[kov:validate-metadata] ${error?.message || String(error)}`);
  process.exitCode = 1;
});
