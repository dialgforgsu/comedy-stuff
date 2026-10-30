// Refreshes data/festivals.generated.js and data/jobs.generated.js.
//
// Festivals: improvfestivals.org JSON feed (CC BY-SA 4.0) + crowdwork.com/festivals + each
//            festival's own site (deadline/fee hints), merged under your hand-edited data/festivals.js.
// Jobs:      EntertainmentCareers.net public job sitemap (robots.txt permits it), comedy-only, US-only,
//            no restaurant roles. Indeed and ZipRecruiter are NOT scraped (see README); they appear as
//            search links in data/jobs.js.
//
// Run: npm run update
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA = "ComedyBoardBot/1.0 (+https://github.com/dialgforgsu/comedy-stuff)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const TODAY_ISO = iso(TODAY);
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

async function get(url, { json = false, timeout = 20000 } = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: json ? "application/json" : "text/html,application/xml" }, redirect: "follow", signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return json ? res.json() : res.text();
}

function loadCurated(file, key) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), "utf8"), ctx);
  return ctx.window[key] || [];
}

// ---------- shared date helpers ----------
const MD_RE = new RegExp(`\\b(${MONTHS.join("|")})[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?`, "gi");
function mkDate(mon, day, year) {
  const m = MONTHS.indexOf(mon.slice(0, 3).toLowerCase());
  if (m < 0) return null;
  const d = new Date(year, m, +day);
  return d.getMonth() === m ? iso(d) : null;
}
// "Mar 4 – Mar 7, 2027" -> ["2027-03-04","2027-03-07"]
function parseRange(s) {
  const found = [...s.matchAll(MD_RE)];
  if (!found.length) return [null, null];
  const endYear = found[found.length - 1][3] ? +found[found.length - 1][3] : null;
  const dates = found.map((m) => mkDate(m[1], m[2], m[3] ? +m[3] : endYear || NOW.getFullYear()));
  if (dates.length > 1 && dates[0] > dates[1] && !found[0][3]) dates[0] = mkDate(found[0][1], found[0][2], endYear - 1);
  return [dates[0], dates[dates.length - 1]];
}
const norm = (n) => n.toLowerCase().replace(/&/g, "and").replace(/\b(the|festival|fest|improv|improvisation|improvisational|comedy|international|annual|\d{4})\b/g, "").replace(/[^a-z0-9]/g, "");
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

// ---------- festival sources ----------
function parseLocation(loc) {
  const parts = (loc || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return { city: loc || "", country: "" };
  const last = parts[parts.length - 1];
  const country = /^(us|usa|united states)$/i.test(last) ? "US" : last;
  return { city: parts.slice(0, -1).join(", "), country };
}
function inferFormats(text) {
  const t = text.toLowerCase(), f = [];
  if (/improv/.test(t)) f.push("Improv");
  if (/sketch/.test(t)) f.push("Sketch");
  if (/stand-?up/.test(t)) f.push("Stand-up");
  if (/musical/.test(t)) f.push("Musical");
  if (/film|video/.test(t) && !f.includes("Improv")) f.push("Film");
  return f.length ? f : ["Mixed"];
}

async function fromImprovFestivals() {
  const data = await get("https://improvfestivals.org/api/festivals.json", { json: true });
  log(`improvfestivals.org: ${data.festivals.length} festivals`);
  return data.festivals.map((f) => {
    const s = f.submissions || {};
    return {
      key: f.slug, name: f.name, ...parseLocation(f.location),
      formats: inferFormats(`${f.name} ${f.description || ""}`),
      eventStart: f.date_start || null, eventEnd: f.date_end || f.date_start || null,
      submissionOpens: s.start_date || null,
      submissionStatus: s.status === "open" || s.status === "closed" ? s.status : null,
      deadlineDate: s.end_date || null, fee: null,
      websites: f.websites || [], notes: "",
      listing: { name: "improvfestivals.org", url: f.url }
    };
  });
}

async function fromCrowdWork() {
  const out = [];
  const list = cheerio.load(await get("https://www.crowdwork.com/festivals"));
  const links = [...new Set(list("a.card-festival").map((_, a) => list(a).attr("href")).get())];
  log(`crowdwork.com: ${links.length} festivals`);
  for (const href of links) {
    await sleep(1500);
    try {
      const url = new URL(href, "https://www.crowdwork.com").href;
      const $ = cheerio.load(await get(url));
      const name = $("h1").first().text().trim() || $("title").text().split("|")[0].trim();
      const dateLine = $("i.bi-calendar3").first().parent().text().trim();
      const [eventStart, eventEnd] = parseRange(dateLine);
      const place = $("i.bi-geo-alt").first().parent().text().trim();
      const dl = $("small").filter((_, e) => /application deadline/i.test($(e).text())).first().closest("div").text();
      const [deadlineDate] = parseRange(dl.replace(/application deadline/i, ""));
      const fee = (($("body").text().match(/Application Fee:\s*([^\n]+)/i) || [])[1] || "").trim() || null;
      const site = $("a").filter((_, e) => /visit website/i.test($(e).text())).first().attr("href");
      const submit = $("a").filter((_, e) => /submit to festival/i.test($(e).text())).first().attr("href");
      out.push({ key: href.split("/").pop(), name, ...parseLocation(place), eventStart, eventEnd, deadlineDate, fee, websites: [site].filter(Boolean), submitUrl: submit || null, listing: { name: "CrowdWork", url } });
    } catch (e) { log("  crowdwork skip", href, e.message); }
  }
  return out;
}

// Pull deadline/fee hints from the festival's own page. Hints only: never trusted alone.
const SKIP_HOSTS = /facebook|instagram|eventbrite|filmfreeway|linktr\.ee|twitter|x\.com|tiktok|youtube/i;
async function siteHints(url, eventStart) {
  if (!url || SKIP_HOSTS.test(url)) return null;
  try {
    const $ = cheerio.load(await get(url, { timeout: 12000 }));
    $("script,style,noscript,nav,footer").remove();
    const text = $("body").text().replace(/\s+/g, " ");
    const dates = new Set(), fees = new Set();
    for (const m of text.matchAll(MD_RE)) {
      const ctx = text.slice(Math.max(0, m.index - 100), m.index + m[0].length + 60);
      if (!/deadline|\bdue\b|closes?\b|closing|apply by|submit by|submissions? (?:are )?(?:open )?(?:until|through)/i.test(ctx)) continue;
      let y = m[3] ? +m[3] : NOW.getFullYear();
      let d = mkDate(m[1], m[2], y);
      if (d && !m[3] && d < TODAY_ISO) d = mkDate(m[1], m[2], y + 1);
      if (d && d >= TODAY_ISO && (!eventStart || d < eventStart)) dates.add(d);
    }
    // Only accept a dollar amount stated right next to "submission/application/entry fee".
    const FEE = /(?:(?:submission|application|entry|audition)\s+fee[^$.]{0,40}\$\s?(\d{1,3})\b|\$\s?(\d{1,3})(?:\.00)?\s+(?:\w+\s+){0,2}(?:submission|application|entry)\s+fee)/gi;
    for (const m of text.matchAll(FEE)) fees.add(+(m[1] || m[2]));
    return { dates: [...dates].sort(), fees: [...fees].filter((n) => n >= 5 && n <= 100).sort((a, b) => a - b) };
  } catch { return null; }
}

function feeText(nums) { return nums.length === 1 ? `$${nums[0]}` : nums.length === 2 ? `$${nums[0]}–$${nums[1]}` : null; }

async function buildFestivals() {
  const byKey = new Map();
  const add = (rec) => {
    const k = norm(rec.name) || rec.key;
    const cur = byKey.get(k) || byKey.get([...byKey.keys()].find((x) => byKey.get(x).hosts?.some((h) => rec.websites.map(host).includes(h))));
    if (!cur) { byKey.set(k, { ...rec, hosts: rec.websites.map(host), sources: [rec.listing], deadlineVotes: rec.deadlineDate ? { [rec.deadlineDate]: [rec.listing.name] } : {} }); return; }
    for (const f of ["eventStart", "eventEnd", "city", "country", "submitUrl", "fee"]) if (!cur[f] && rec[f]) cur[f] = rec[f];
    if (!cur.websites.length) cur.websites = rec.websites;
    cur.hosts = [...new Set([...(cur.hosts || []), ...rec.websites.map(host)])];
    cur.sources.push(rec.listing);
    if (rec.deadlineDate) (cur.deadlineVotes[rec.deadlineDate] ||= []).push(rec.listing.name);
    if (!cur.deadlineDate && rec.deadlineDate) cur.deadlineDate = rec.deadlineDate;
    if (!cur.submissionOpens && rec.submissionOpens) cur.submissionOpens = rec.submissionOpens;
  };
  const results = await Promise.allSettled([fromImprovFestivals(), fromCrowdWork()]);
  results.forEach((r, i) => r.status === "fulfilled" ? r.value.forEach(add) : log("SOURCE FAILED", ["improvfestivals.org", "crowdwork.com"][i], r.reason.message));

  const all = [...byKey.values()].filter((f) => (f.eventEnd || f.eventStart || "9999") >= TODAY_ISO);
  log(`merged ${all.length} upcoming festivals; reading official sites...`);
  let n = 0;
  for (const f of all) {
    // Only worth a visit if something is still unknown or still open.
    if (f.submissionStatus === "closed" && f.deadlineDate && f.deadlineDate < TODAY_ISO) continue;
    const site = f.websites.find((u) => !SKIP_HOSTS.test(u));
    if (!site) continue;
    await sleep(800);
    const h = await siteHints(site, f.eventStart);
    if (!h) continue;
    n++;
    f.officialSite = site;
    if (f.deadlineDate && h.dates.includes(f.deadlineDate)) (f.deadlineVotes[f.deadlineDate] ||= []).push("festival site");
    else if (!f.deadlineDate && h.dates.length === 1) { f.deadlineDate = h.dates[0]; f.deadlineVotes[h.dates[0]] = ["festival site"]; f.deadlineFromSiteOnly = true; }
    if (!f.fee && h.fees.length) f.fee = feeText(h.fees);
    if (!f.fee && h.fees.length) f.feeFromSite = true;
  }
  log(`official sites read: ${n}`);
  return all;
}

function toFestival(a) {
  const votes = a.deadlineDate ? (a.deadlineVotes[a.deadlineDate] || []) : [];
  const corroborated = new Set(votes).size >= 2;
  const sources = [...a.sources];
  if (a.officialSite) sources.push({ name: "festival site", url: a.officialSite });
  const notes = [];
  if (a.deadlineFromSiteOnly) notes.push("Deadline read from the festival's site, so double-check it.");
  return {
    id: a.key, name: a.name, city: a.city, country: a.country || "",
    formats: a.formats && a.formats.length ? a.formats : ["Mixed"],
    eventStart: a.eventStart, eventEnd: a.eventEnd, submissionOpens: a.submissionOpens || null,
    submissionStatus: a.submissionStatus || null,
    deadlines: a.deadlineDate ? [{ label: "Submissions close", date: a.deadlineDate, fee: a.fee || null }] : [],
    fee: a.fee || null,
    notes: notes.join(" "),
    url: a.officialSite || a.websites[0] || a.listing.url,
    submitUrl: a.submitUrl || null,
    sources, confirmed: corroborated, checked: TODAY_ISO
  };
}

const AGGREGATOR = /improvfestivals|crowdwork|filmfreeway/i;
const trimSlash = (u) => (u || "").replace(/\/+$/, "");
function mergeCurated(auto, curated) {
  const out = [...auto];
  for (const c of curated) {
    if ((c.eventEnd || c.eventStart || "9999") < TODAY_ISO && !c.deadlines.some((d) => d.date >= TODAY_ISO)) continue;
    const cu = trimSlash(c.url);
    const i = out.findIndex((a) => norm(a.name) === norm(c.name) || a.sources.some((s) => trimSlash(s.url) === cu) || (!AGGREGATOR.test(host(c.url)) && host(a.url) === host(c.url)));
    if (i < 0) { out.push({ ...c, sources: [{ name: "curated", url: c.url }] }); continue; }
    const a = out[i];
    const merged = { ...a };
    const empty = (v) => v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length);
    for (const [k, v] of Object.entries(c)) {
      if (k === "id" || k === "override" || empty(v)) continue;
      // Curated values only beat the feeds when marked override:true; otherwise they just fill gaps.
      if (c.override || empty(a[k])) merged[k] = v;
    }
    merged.confirmed = c.override ? c.confirmed === true || a.confirmed : a.confirmed;
    merged.sources = [...a.sources, { name: "curated", url: c.url }];
    out[i] = merged;
  }
  return out;
}

// ---------- jobs ----------
const COMEDY_SLUG = /comed|improv|stand-?up|sketch|humou?r|late-night|comic|writers-room|joke|funny|snl|saturday-night/i;
const COMEDY_TEXT = /comed|improv|stand-?up|sketch|humou?r|late[- ]night|comic\b|writers['’]? room/i;
const RESTAURANT = /restaurant|waiter|waitress|waitstaff|\bserver\b|bartend|barista|busser|hostess|\bhost\/|line cook|\bcook\b|kitchen|dishwash|food (?:and|&) beverage|catering|sous chef|\bchef\b|food runner/i;
const US_NAMES = /^(us|usa|united states|united states of america)$/i;

function typeOf(t) {
  if (/teach|instruct|coach|faculty/i.test(t)) return "Teaching";
  if (/produc|booker|booking|programm/i.test(t)) return "Production";
  if (/writer|writing|editor/i.test(t)) return "Writing";
  if (/perform|cast|actor|comedian|host/i.test(t)) return "Performing";
  if (/market|social|communications|brand|publicist/i.test(t)) return "Marketing";
  if (/director|manager|supervisor|head of/i.test(t)) return "Management";
  return "Admin";
}
const SCHEDULE = { FULL_TIME: "Full-time", PART_TIME: "Part-time", CONTRACTOR: "Contract", TEMPORARY: "Temporary", INTERN: "Internship", PER_DIEM: "Per diem" };

function pay(base) {
  const v = base?.value; if (!v) return null;
  const unit = { YEAR: "/yr", HOUR: "/hr", MONTH: "/mo", WEEK: "/wk", DAY: "/day" }[v.unitText] || "";
  const n = (x) => (x >= 1000 ? `$${Math.round(x / 1000)}K` : `$${x}`);
  if (v.minValue && v.maxValue && v.minValue !== v.maxValue) return `${n(v.minValue)}–${n(v.maxValue)}${unit}`;
  const one = v.value || v.minValue || v.maxValue; return one ? `${n(one)}${unit}` : null;
}

async function fromEntertainmentCareers() {
  const xml = await get("https://www.entertainmentcareers.net/sitemaps/job_sitemap_SEO.asp", { timeout: 40000 });
  const urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))].filter((u) => /\/job\/\d+\/?$/.test(u));
  const candidates = urls.filter((u) => COMEDY_SLUG.test(u)).slice(0, 80);
  log(`entertainmentcareers.net: ${urls.length} jobs in sitemap, ${candidates.length} look comedy-related`);
  const jobs = [];
  for (const url of candidates) {
    await sleep(1200);
    try {
      const html = await get(url);
      const ld = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return null; } }).find((o) => o && o["@type"] === "JobPosting");
      if (!ld) continue;
      const desc = cheerio.load(`<div>${ld.description || ""}</div>`)("div").text().replace(/\s+/g, " ").trim();
      const title = ld.title || "", org = ld.hiringOrganization?.name || "";
      if (!COMEDY_TEXT.test(`${title} ${desc}`)) continue;
      if (RESTAURANT.test(`${title} ${org} ${desc.slice(0, 400)}`)) { log("  skip restaurant:", title); continue; }
      if (ld.validThrough && new Date(ld.validThrough) < NOW) continue;
      const remote = /TELECOMMUTE/i.test(ld.jobLocationType || "");
      const addr = (Array.isArray(ld.jobLocation) ? ld.jobLocation[0] : ld.jobLocation)?.address || {};
      const country = typeof addr.addressCountry === "object" ? addr.addressCountry?.name : addr.addressCountry;
      if (country && !US_NAMES.test(country)) { log("  skip non-US:", title, country); continue; }
      if (!country && !remote) continue;
      jobs.push({
        title, org, location: remote ? "Remote (US)" : [addr.addressLocality, addr.addressRegion].filter(Boolean).join(", "),
        region: remote ? "Remote" : "US", type: typeOf(title), pay: pay(ld.baseSalary), schedule: SCHEDULE[[].concat(ld.employmentType || [])[0]] || null,
        notes: desc.slice(0, 200).replace(/\s+\S*$/, "") + "…", url, posted: ld.datePosted || null,
        source: "EntertainmentCareers.net", checked: TODAY_ISO
      });
    } catch (e) { log("  job skip", url, e.message); }
  }
  return jobs;
}

// ---------- write ----------
function writeJs(file, header, assignments) {
  const body = Object.entries(assignments).map(([k, v]) => `window.${k} = ${JSON.stringify(v, null, 1)};`).join("\n");
  fs.writeFileSync(path.join(ROOT, file), `// ${header}\n// Generated by scripts/update.mjs on ${NOW.toISOString()}. Do not edit by hand; edit data/festivals.js or data/jobs.js.\n${body}\n`);
}

const only = process.argv[2]; // "festivals" | "jobs" | undefined
const meta = { generatedAt: NOW.toISOString() };

if (!only || only === "festivals") {
  try {
    const auto = (await buildFestivals()).map(toFestival);
    const merged = mergeCurated(auto, loadCurated("data/festivals.js", "FESTIVALS"));
    writeJs("data/festivals.generated.js", "Festival data merged from improvfestivals.org (CC BY-SA 4.0), CrowdWork, festival sites and curated entries.", { FESTIVALS_GENERATED: merged, FESTIVALS_META: meta });
    log(`wrote ${merged.length} festivals`);
  } catch (e) { console.error("festival update failed, keeping previous file:", e.message); process.exitCode = 1; }
}
if (!only || only === "jobs") {
  try {
    const jobs = await fromEntertainmentCareers();
    writeJs("data/jobs.generated.js", "Jobs pulled from EntertainmentCareers.net (comedy-related, US only, no restaurant roles).", { JOBS_GENERATED: jobs, JOBS_META: meta });
    log(`wrote ${jobs.length} jobs`);
  } catch (e) { console.error("job update failed, keeping previous file:", e.message); process.exitCode = 1; }
}
