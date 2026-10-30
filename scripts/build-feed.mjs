// Builds festivals.ics, a calendar feed people can subscribe to (Google / Apple / Outlook).
// Reads the merged festival data, so run it after `npm run update`. Usage: npm run feed
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
function load(file) {
  const win = {};
  const p = path.join(root, "data", file);
  if (fs.existsSync(p)) vm.runInNewContext(fs.readFileSync(p, "utf8"), { window: win });
  return win;
}
const gen = load("festivals.generated.js");
const festivals = gen.FESTIVALS_GENERATED || load("festivals.js").FESTIVALS || [];
const stamp = ((gen.FESTIVALS_META || {}).generatedAt || new Date().toISOString()).replace(/[-:]/g, "").replace(/\.\d+/, "");

const ymd = (d) => d.replace(/-/g, "");
function plusDay(d) {
  const [y, m, day] = d.split("-").map(Number);
  const x = new Date(Date.UTC(y, m - 1, day + 1));
  return x.toISOString().slice(0, 10).replace(/-/g, "");
}
const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
// RFC 5545 line folding: 75 octets per line, continuation lines start with a space.
function fold(line) {
  const out = []; let cur = "", bytes = 0;
  for (const ch of line) {
    const n = Buffer.byteLength(ch);
    if (bytes + n > 74) { out.push(cur); cur = " " + ch; bytes = 1 + n; } else { cur += ch; bytes += n; }
  }
  out.push(cur);
  return out.join("\r\n");
}
const todayStr = new Date().toISOString().slice(0, 10);
const events = [];
function add(uid, title, start, end, desc, loc, alarmDays) {
  const l = ["BEGIN:VEVENT", `UID:${uid}@comedy-stuff`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(start)}`, `DTEND;VALUE=DATE:${plusDay(end || start)}`, `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(desc)}`];
  if (loc) l.push(`LOCATION:${esc(loc)}`);
  if (alarmDays) l.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(title)}`, `TRIGGER:-P${alarmDays}D`, "END:VALARM");
  l.push("END:VEVENT");
  events.push(l.map(fold).join("\r\n"));
}
for (const f of festivals) {
  const loc = f.city + (f.country && f.country !== "US" ? ", " + f.country : "");
  for (const d of f.deadlines || []) {
    if (d.date < todayStr) continue;
    add(`${f.id}-deadline-${d.date}`, `Deadline: ${f.name}`, d.date, d.date, `${d.label} for ${f.name}${d.fee ? ` (fee ${d.fee})` : ""}. Details: ${f.url}`, loc, 3);
  }
  if (f.eventStart && (f.eventEnd || f.eventStart) >= todayStr) add(`${f.id}-event-${f.eventStart}`, f.name, f.eventStart, f.eventEnd, `Details: ${f.url}`, loc, 0);
}
const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//comedy-stuff//festivals//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
  "X-WR-CALNAME:Improv festival deadlines", "REFRESH-INTERVAL;VALUE=DURATION:P1D", "X-PUBLISHED-TTL:PT12H", ...events, "END:VCALENDAR"].join("\r\n") + "\r\n";
fs.writeFileSync(path.join(root, "festivals.ics"), body);
console.log(`festivals.ics: ${events.length} events`);
