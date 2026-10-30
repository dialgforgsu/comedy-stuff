// Builds the biweekly email digest: new festivals, deadlines in the next 14 days, new jobs.
//
//   node scripts/digest.mjs            writes digest.md and, if BUTTONDOWN_API_KEY is set, creates a DRAFT email
//   node scripts/digest.mjs --dry-run  prints the digest, changes nothing
//
// It never sends. The draft waits in Buttondown until you review and send (or schedule) it,
// which is what keeps the list to one email every two weeks.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry-run");
const SITE = "https://dialgforgsu.github.io/comedy-stuff/";
const STATE = path.join(root, "data", "digest-state.json");

function load(file) {
  const win = {};
  const p = path.join(root, "data", file);
  if (fs.existsSync(p)) vm.runInNewContext(fs.readFileSync(p, "utf8"), { window: win });
  return win;
}
const fg = load("festivals.generated.js"), jg = load("jobs.generated.js"), jh = load("jobs.js");
const festivals = fg.FESTIVALS_GENERATED || load("festivals.js").FESTIVALS || [];
const jobs = (jh.JOBS || []).concat(jg.JOBS_GENERATED || []);

// Feed data is untrusted text going into an email: strip markdown/HTML control characters, allow https links only.
const clean = (s) => String(s || "").replace(/[\[\]()<>`*_#|\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
const link = (s) => (/^https:\/\/[^\s)]+$/.test(String(s || "")) ? s : SITE);
const key = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const jobKey = (j) => key(j.title) + "|" + key(j.org);

const today = new Date().toISOString().slice(0, 10);
const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const daysAgo = (d) => Math.round((Date.parse(today) - Date.parse(d)) / 864e5);
const fmt = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const prev = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, "utf8")) : null;
const seenF = new Set(prev ? prev.festivalIds : festivals.map((f) => f.id)); // first run: nothing counts as "new"
const seenJ = new Set(prev ? prev.jobKeys : []);

const upcoming = (f) => (f.eventEnd || f.eventStart || "9") >= today;
const newFest = festivals.filter((f) => !seenF.has(f.id) && upcoming(f));
const closing = [];
for (const f of festivals) {
  const d = (f.deadlines || []).find((x) => x.date >= today && x.date <= inDays(14));
  if (d) closing.push({ f, d });
}
closing.sort((a, b) => a.d.date.localeCompare(b.d.date));
const newJobs = jobs
  .filter((j) => (j.region === "US" || j.region === "Remote") && !j.searchLink && /^https:\/\//.test(j.url || ""))
  .filter((j) => !seenJ.has(jobKey(j)) && (!j.posted || daysAgo(j.posted) <= 30))
  .slice(0, 15);

const lines = [];
lines.push("Here's what's new on the [Improv Fest & Jobs Board](" + SITE + ") in the last two weeks.", "");
if (closing.length) {
  lines.push("## Deadlines in the next 14 days", "");
  for (const { f, d } of closing) lines.push(`- **${fmt(d.date)}**: [${clean(f.name)}](${link(f.url)}) (${clean(f.city)})${d.fee ? ", " + clean(d.fee) : ""}`);
  lines.push("");
}
if (newFest.length) {
  lines.push("## New festivals", "");
  for (const f of newFest.slice(0, 20)) lines.push(`- [${clean(f.name)}](${link(f.url)}) in ${clean(f.city)}${f.eventStart ? ", " + fmt(f.eventStart) : ""}`);
  lines.push("");
}
if (newJobs.length) {
  lines.push("## New comedy jobs", "");
  for (const j of newJobs) lines.push(`- [${clean(j.title)}](${link(j.url)}), ${clean(j.org)}${j.pay ? " (" + clean(j.pay) + ")" : ""}`);
  lines.push("");
}
const empty = !closing.length && !newFest.length && !newJobs.length;
lines.push(`[See everything and add dates to your calendar](${SITE}). Deadlines and fees change, so confirm on the festival's site before paying.`);
const body = lines.join("\n");
const subject = "Comedy festival deadlines and jobs, " + fmt(today);

if (dry) { console.log(subject + "\n\n" + body); process.exit(0); }
if (empty) { console.log("Nothing new or closing soon; no digest this round."); process.exit(0); }

fs.writeFileSync(path.join(root, "digest.md"), "# " + subject + "\n\n" + body + "\n");
console.log(`digest.md written (${closing.length} closing, ${newFest.length} new festivals, ${newJobs.length} new jobs)`);

const key_ = process.env.BUTTONDOWN_API_KEY;
if (key_) {
  const res = await fetch("https://api.buttondown.com/v1/emails", {
    method: "POST",
    headers: { Authorization: "Token " + key_, "Content-Type": "application/json" },
    body: JSON.stringify({ subject, body, status: "draft" }),
  });
  if (!res.ok) { console.error("Buttondown draft failed:", res.status, (await res.text()).slice(0, 300)); process.exit(1); }
  console.log("Draft created in Buttondown. Review and send it from your dashboard.");
} else {
  console.log("No BUTTONDOWN_API_KEY set; digest.md is the only output.");
}

fs.writeFileSync(STATE, JSON.stringify({ lastDigest: today, festivalIds: festivals.map((f) => f.id), jobKeys: jobs.map(jobKey) }, null, 1) + "\n");
