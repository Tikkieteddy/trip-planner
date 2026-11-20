import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const file = fileURLToPath(new URL("./HANDOVER_DASHBOARD.html", import.meta.url));
const html = readFileSync(file, "utf8");
const ids = [...html.matchAll(/(?:^|\s)id="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length) throw new Error(`Duplicate IDs: ${[...new Set(duplicateIds)].join(", ")}`);

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
if (!scripts.length) throw new Error("No inline dashboard scripts found");
scripts.forEach((script, index) => new vm.Script(script, { filename: `dashboard-script-${index + 1}.js` }));

const brokenLinks = [];
for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
  if (/^(?:https?:|mailto:|#)/i.test(href)) continue;
  const target = resolve(dirname(file), href.split("#")[0]);
  if (!existsSync(target)) brokenLinks.push(href);
}
if (brokenLinks.length) throw new Error(`Broken relative links: ${brokenLinks.join(", ")}`);

const featureRows = html.match(/const rows=\[(.*?)\];const fl=/s)?.[1];
if (!featureRows) throw new Error("Feature rows not found");
const featureCount = [...featureRows.matchAll(/\['[^']+','(Implemented|Partial|Deprecated|NOT FOUND)'/g)];
const counts = Object.fromEntries(["Implemented", "Partial", "Deprecated", "NOT FOUND"].map((status) => [
  status,
  featureCount.filter(([, value]) => value === status).length,
]));
if (featureCount.length !== 20 || counts.Implemented !== 7 || counts.Partial !== 10 || counts.Deprecated !== 1 || counts["NOT FOUND"] !== 2) {
  throw new Error(`Unexpected feature inventory: ${JSON.stringify(counts)}`);
}

for (const section of ["overview", "architecture", "structure", "sitemap", "wireframes", "features", "data", "workflow", "risks", "roadmap", "claude", "docs"]) {
  if (!ids.includes(section)) throw new Error(`Missing dashboard section: ${section}`);
}

console.log(`Dashboard static validation passed: ${ids.length} unique IDs, ${scripts.length} valid scripts, all local links resolve.`);
