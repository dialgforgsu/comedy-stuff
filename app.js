(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  // Generated feeds (npm run update) win; hand-edited files are the fallback.
  var FESTIVALS = (window.FESTIVALS_GENERATED || window.FESTIVALS || []).map(function (f) {
    f.deadlines = f.deadlines || []; f.formats = f.formats || []; f.country = f.country || ""; return f;
  });
  var BOARDS = window.JOB_BOARDS || [];
  // US-only, no restaurant roles, even if a hand-edited entry slips one in.
  var RESTAURANT = /restaurant|waiter|waitress|waitstaff|\bserver\b|bartend|barista|busser|hostess|line cook|\bcook\b|kitchen|dishwash|food (?:and|&) beverage|catering|sous chef|\bchef\b|food runner/i;
  // The same job can arrive hand-listed and auto-pulled: merge them, keeping whichever has a direct link.
  function key(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  var byKey = {}, JOBS = [];
  (window.JOBS || []).concat(window.JOBS_GENERATED || []).forEach(function (j) {
    if (j.region !== "US" && j.region !== "Remote") return;
    if (RESTAURANT.test(j.title + " " + j.org)) return;
    // Search links are shared by many jobs, so only direct links count as a URL match.
    var k = key(j.title) + "|" + key(j.org), prev = (!j.searchLink && byKey[j.url]) || byKey[k];
    if (prev) {
      if (prev.searchLink && !j.searchLink) { j.pay = j.pay || prev.pay; prev.url = j.url; prev.searchLink = false; prev.source = j.source || prev.source; }
      ["pay", "schedule", "notes", "posted"].forEach(function (f) { if (!prev[f] && j[f]) prev[f] = j[f]; });
      return;
    }
    byKey[k] = j; if (!j.searchLink) byKey[j.url] = j;
    JOBS.push(j);
  });
  JOBS.sort(function (a, b) { return (b.posted || "").localeCompare(a.posted || "") || (a.title < b.title ? -1 : 1); });
  var $ = function (id) { return document.getElementById(id); };

  // ---------- helpers ----------
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function track(name, params) { if (window.gtag) window.gtag("event", name, params || {}); }
  function parse(d) { var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmt(d) { var x = parse(d); return MON[x.getMonth()] + " " + x.getDate() + ", " + x.getFullYear(); }
  function fmtRange(a, b) {
    if (!a) return "Dates TBA";
    if (!b || a === b) return fmt(a);
    var x = parse(a), y = parse(b);
    if (x.getMonth() === y.getMonth() && x.getFullYear() === y.getFullYear())
      return MON[x.getMonth()] + " " + x.getDate() + "–" + y.getDate() + ", " + x.getFullYear();
    return fmt(a) + " – " + fmt(b);
  }
  function ymd(d) { return d.replace(/-/g, ""); }
  function addDays(d, n) {
    var x = parse(d); x.setDate(x.getDate() + n);
    return x.getFullYear() + String(x.getMonth() + 1).padStart(2, "0") + String(x.getDate()).padStart(2, "0");
  }
  function daysUntil(d) { return Math.round((parse(d) - today()) / 86400000); }

  // ---------- festival status ----------
  function finalDeadline(f) { return f.deadlines.length ? f.deadlines[f.deadlines.length - 1].date : null; }
  function status(f) {
    var fd = finalDeadline(f);
    if (fd) {
      var left = daysUntil(fd);
      if (left < 0) return { key: "closed", label: "Closed", rank: 3 };
      if (left <= 14) return { key: "soon", label: left === 0 ? "Closes today" : "Closes in " + left + (left === 1 ? " day" : " days"), rank: 0, left: left };
      return { key: "open", label: "Open", rank: 1, left: left };
    }
    if (f.submissionStatus === "closed") return { key: "closed", label: "Closed", rank: 3 };
    if (f.submissionStatus === "open") return { key: "open", label: "Open (no deadline listed)", rank: 1, left: 9998 };
    if (f.submissionOpens && daysUntil(f.submissionOpens) > 0) return { key: "upcoming", label: "Opens " + fmt(f.submissionOpens), rank: 2, left: 9999 };
    if (f.eventStart && daysUntil(f.eventStart) < 0) return { key: "closed", label: "Ended", rank: 3 };
    return { key: "unknown", label: "Deadline unknown", rank: 2, left: 9999 };
  }
  function isUS(f) { return f.country === "US"; }

  // ---------- calendar ----------
  function googleUrl(title, start, end, details, location) {
    // all-day event: end date is exclusive
    var q = new URLSearchParams({
      action: "TEMPLATE", text: title,
      dates: ymd(start) + "/" + addDays(end || start, 1),
      details: details || "", location: location || ""
    });
    return "https://calendar.google.com/calendar/render?" + q.toString();
  }
  function icsEscape(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  function icsEvent(uid, title, start, end, details, location, alarmDays) {
    var lines = [
      "BEGIN:VEVENT", "UID:" + uid + "@comedy-festivals-jobs",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""),
      "DTSTART;VALUE=DATE:" + ymd(start), "DTEND;VALUE=DATE:" + addDays(end || start, 1),
      "SUMMARY:" + icsEscape(title), "DESCRIPTION:" + icsEscape(details)
    ];
    if (location) lines.push("LOCATION:" + icsEscape(location));
    if (alarmDays) lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEscape(title), "TRIGGER:-P" + alarmDays + "D", "END:VALARM");
    lines.push("END:VEVENT");
    return lines.join("\r\n");
  }
  function downloadIcs(filename, events) {
    var body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//comedy-festivals-jobs//EN", "CALSCALE:GREGORIAN"].concat(events, ["END:VCALENDAR"]).join("\r\n");
    var url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
    var a = el("a", { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function calRow(label, f, kind, d) {
    var title = (kind === "deadline" ? "Submission deadline: " : "") + f.name;
    var loc = f.city + (f.country && f.country !== "US" ? ", " + f.country : "");
    var details = (kind === "deadline" ? d.label + " for " + f.name + (d.fee ? " (fee " + d.fee + ")" : "") + ". " : "") + "Details: " + f.url;
    var start = kind === "deadline" ? d.date : f.eventStart;
    var end = kind === "deadline" ? d.date : f.eventEnd;
    var alarm = kind === "deadline" ? (CFG.reminderDaysBefore || 3) : 0;
    var g = el("a", { class: "btn", href: googleUrl(title, start, end, details, loc), target: "_blank", rel: "noopener", text: "Google" });
    g.addEventListener("click", function () { track("add_to_calendar", { provider: "google", kind: kind, festival: f.id }); });
    var i = el("button", { class: "btn", type: "button", text: "Apple / Outlook (.ics)" });
    i.addEventListener("click", function () {
      downloadIcs(f.id + "-" + kind + ".ics", [icsEvent(f.id + "-" + kind + "-" + start, title, start, end, details, loc, alarm)]);
      track("add_to_calendar", { provider: "ics", kind: kind, festival: f.id });
    });
    return el("div", { class: "cal-row" }, [label ? el("span", { text: label }) : null, g, i]);
  }

  // ---------- festival cards ----------
  function festivalCard(f) {
    var st = status(f);
    var badges = el("div", { class: "badges" }, [el("span", { class: "badge " + (st.key === "open" ? "open" : st.key === "soon" ? "soon" : ""), text: st.label })]);
    if (!f.confirmed) badges.appendChild(el("span", { class: "badge check", text: "Verify", title: "Not yet confirmed on the festival's own site" }));
    f.formats.forEach(function (x) { badges.appendChild(el("span", { class: "badge fmt", text: x })); });

    var title = el("h3", {}, [el("a", { href: f.url, target: "_blank", rel: "noopener", text: f.name })]);
    title.firstChild.addEventListener("click", function () { track("outbound_festival", { festival: f.id }); });

    var dl = el("dl");
    function row(k, v) { dl.appendChild(el("dt", { text: k })); dl.appendChild(el("dd", { text: v })); }
    row("Event", fmtRange(f.eventStart, f.eventEnd));
    if (f.submissionOpens) row("Opens", fmt(f.submissionOpens));
    if (f.deadlines.length) {
      f.deadlines.forEach(function (d) { row(d.label, fmt(d.date) + (d.fee ? " · " + d.fee : "")); });
    } else {
      row("Deadline", "Not published, check site");
    }
    if (!f.deadlines.some(function (d) { return d.fee; })) row("Fee", f.fee || "Not published, check site");

    var cal = el("div", { class: "cal" });
    var future = f.deadlines.filter(function (d) { return daysUntil(d.date) >= 0; });
    future.forEach(function (d) { cal.appendChild(calRow("Remind me: " + d.label.toLowerCase() + " (" + fmt(d.date) + ")", f, "deadline", d)); });
    if (f.eventStart && daysUntil(f.eventEnd || f.eventStart) >= 0) cal.appendChild(calRow("Add event dates (" + fmtRange(f.eventStart, f.eventEnd) + ")", f, "event"));

    var src = el("p", { class: "src" });
    src.appendChild(document.createTextNode("Source: "));
    (f.sources || []).forEach(function (s, i) {
      if (i) src.appendChild(document.createTextNode(", "));
      var a = el("a", { href: s.url, target: "_blank", rel: "noopener", text: s.name });
      a.addEventListener("click", function () { track("outbound_source", { source: s.name, festival: f.id }); });
      src.appendChild(a);
    });
    if (f.submitUrl) {
      var sub = el("a", { class: "btn primary", href: f.submitUrl, target: "_blank", rel: "noopener", text: "Submit" });
      sub.addEventListener("click", function () { track("outbound_submit", { festival: f.id }); });
      cal.insertBefore(el("div", { class: "cal-row" }, [sub]), cal.firstChild);
    }

    return el("article", { class: "card" }, [
      title, el("div", { class: "loc", text: f.city + (f.country && f.country !== "US" ? ", " + f.country : "") }),
      badges, dl, f.notes ? el("p", { class: "notes", text: f.notes }) : null,
      cal.children.length ? cal : null, f.sources && f.sources.length ? src : null
    ]);
  }

  function renderFestivals() {
    var q = $("fSearch").value.trim().toLowerCase(), region = $("fRegion").value, format = $("fFormat").value, stf = $("fStatus").value;
    var list = FESTIVALS.filter(function (f) {
      var s = status(f);
      if (q && (f.name + " " + f.city + " " + f.country).toLowerCase().indexOf(q) < 0) return false;
      if (region === "US" && !isUS(f)) return false;
      if (region === "Intl" && isUS(f)) return false;
      if (format && f.formats.indexOf(format) < 0) return false;
      if (stf === "active") return s.key !== "closed";
      if (stf === "open") return s.key === "open" || s.key === "soon";
      if (stf === "closed") return s.key === "closed";
      return true;
    }).sort(function (a, b) {
      var sa = status(a), sb = status(b);
      if (sa.rank !== sb.rank) return sa.rank - sb.rank;
      if (sa.rank <= 1) return (sa.left - sb.left);
      return (a.eventStart || "9").localeCompare(b.eventStart || "9");
    });
    var box = $("fList"); box.textContent = "";
    $("fCount").textContent = list.length + (list.length === 1 ? " festival" : " festivals");
    if (!list.length) box.appendChild(el("div", { class: "empty", text: "No festivals match those filters." }));
    list.forEach(function (f) { box.appendChild(festivalCard(f)); });
  }

  // ---------- closing soon ----------
  var SOON_DAYS = 30;
  function nextDeadline(f) {
    for (var i = 0; i < f.deadlines.length; i++) if (daysUntil(f.deadlines[i].date) >= 0) return f.deadlines[i];
    return null;
  }
  function soonRow(f, d) {
    var left = daysUntil(d.date);
    var when = left === 0 ? "Today" : left === 1 ? "Tomorrow" : "In " + left + " days";
    var name = el("a", { href: f.url, target: "_blank", rel: "noopener", text: f.name });
    name.addEventListener("click", function () { track("outbound_festival", { festival: f.id, from: "closing_soon" }); });
    var meta = [fmt(d.date), d.fee, f.city + (f.country && f.country !== "US" ? ", " + f.country : ""), fmtRange(f.eventStart, f.eventEnd) !== "Dates TBA" ? "Event " + fmtRange(f.eventStart, f.eventEnd) : null].filter(Boolean).join(" · ");
    var actions = el("div", { class: "soon-actions" });
    if (f.submitUrl) {
      var s = el("a", { class: "btn primary", href: f.submitUrl, target: "_blank", rel: "noopener", text: "Submit" });
      s.addEventListener("click", function () { track("outbound_submit", { festival: f.id, from: "closing_soon" }); });
      actions.appendChild(s);
    }
    var row = calRow("", f, "deadline", d);
    while (row.firstChild) actions.appendChild(row.firstChild);
    return el("li", { class: "soon-row" + (left <= 7 ? " urgent" : "") }, [
      el("div", { class: "soon-when", text: when }),
      el("div", { class: "soon-main" }, [el("strong", {}, [name]), el("div", { class: "loc", text: meta }), f.confirmed ? null : el("span", { class: "badge check", text: "Verify" })]),
      actions
    ]);
  }
  function renderSoon() {
    var items = [];
    FESTIVALS.forEach(function (f) {
      var d = nextDeadline(f);
      if (d && daysUntil(d.date) <= SOON_DAYS && status(f).key !== "closed") items.push({ f: f, d: d });
    });
    items.sort(function (a, b) { return a.d.date.localeCompare(b.d.date); });
    var box = $("soonList"); box.textContent = "";
    $("soonCount").textContent = items.length ? items.length + (items.length === 1 ? " festival" : " festivals") + " in the next " + SOON_DAYS + " days" : "";
    if (!items.length) box.appendChild(el("li", { class: "empty", text: "No known deadlines in the next " + SOON_DAYS + " days." }));
    items.forEach(function (x) { box.appendChild(soonRow(x.f, x.d)); });
  }

  // ---------- jobs ----------
  function jobCard(j) {
    var title = el("h3", {}, [el("a", { href: j.url, target: "_blank", rel: "noopener", text: j.title })]);
    title.firstChild.addEventListener("click", function () { track("outbound_job", { job: j.title, org: j.org }); });
    var badges = el("div", { class: "badges" }, [el("span", { class: "badge fmt", text: j.type }), el("span", { class: "badge fmt", text: j.region })]);
    if (j.schedule) badges.appendChild(el("span", { class: "badge fmt", text: j.schedule }));
    var dl = el("dl");
    if (j.pay) { dl.appendChild(el("dt", { text: "Pay" })); dl.appendChild(el("dd", { text: j.pay })); }
    if (j.posted) { dl.appendChild(el("dt", { text: "Posted" })); dl.appendChild(el("dd", { text: fmt(j.posted) })); }
    dl.appendChild(el("dt", { text: "Checked" })); dl.appendChild(el("dd", { text: fmt(j.checked) }));
    if (j.source) { dl.appendChild(el("dt", { text: "Source" })); dl.appendChild(el("dd", { text: j.source })); }
    return el("article", { class: "card" }, [
      title, el("div", { class: "loc", text: j.org + " · " + j.location }), badges,
      j.notes ? el("p", { class: "notes", text: j.notes }) : null, dl,
      el("div", { class: "cal" }, [el("a", { class: "btn primary", href: j.url, target: "_blank", rel: "noopener", text: j.searchLink ? "Find it on " + (j.source || "the board") : "View listing" })])
    ]);
  }
  function renderJobs() {
    var q = $("jSearch").value.trim().toLowerCase(), region = $("jRegion").value, type = $("jType").value;
    var list = JOBS.filter(function (j) {
      if (q && (j.title + " " + j.org + " " + j.location + " " + (j.notes || "")).toLowerCase().indexOf(q) < 0) return false;
      if (region && j.region !== region) return false;
      if (type && j.type !== type) return false;
      return true;
    });
    var box = $("jList"); box.textContent = "";
    $("jCount").textContent = list.length + (list.length === 1 ? " job" : " jobs");
    if (!list.length) box.appendChild(el("div", { class: "empty", text: "No jobs match those filters. Try the boards below." }));
    list.forEach(function (j) { box.appendChild(jobCard(j)); });
  }
  function renderBoards() {
    var ul = $("boards");
    BOARDS.forEach(function (b) {
      var a = el("a", { href: b.url, target: "_blank", rel: "noopener" }, [el("span", { text: b.name }), el("br"), el("small", { text: b.region })]);
      a.addEventListener("click", function () { track("outbound_board", { board: b.name }); });
      ul.appendChild(el("li", {}, [a]));
    });
  }

  // ---------- tabs ----------
  function showTab(name) {
    ["festivals", "jobs"].forEach(function (t) {
      $(t).hidden = t !== name;
      $("tab-" + t).setAttribute("aria-selected", String(t === name));
    });
    if (location.hash.slice(1) !== name) history.replaceState(null, "", "#" + name);
    track("view_tab", { tab: name });
  }

  // ---------- init ----------
  document.title = CFG.siteName || document.title;
  $("siteName").textContent = CFG.siteName || $("siteName").textContent;
  $("submitLink").href = CFG.submitUrl || "#";
  // Freshness stamp: the newest time the updater ran, shown in the visitor's own time zone.
  var stamps = [(window.FESTIVALS_META || {}).generatedAt, (window.JOBS_META || {}).generatedAt].filter(Boolean).sort();
  var newest = stamps.length ? new Date(stamps[stamps.length - 1]) : null;
  if (newest && !isNaN(newest)) {
    var t = $("updated");
    t.textContent = "Data updated " + newest.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) + " (" + (newest.toLocaleTimeString(undefined, { timeZoneName: "short" }).split(" ").pop()) + ")";
    t.setAttribute("datetime", newest.toISOString());
  }
  renderSoon();
  ["fSearch", "fRegion", "fFormat", "fStatus"].forEach(function (id) { $(id).addEventListener("input", renderFestivals); });
  ["jSearch", "jRegion", "jType"].forEach(function (id) { $(id).addEventListener("input", renderJobs); });
  $("tab-festivals").addEventListener("click", function () { showTab("festivals"); });
  $("tab-jobs").addEventListener("click", function () { showTab("jobs"); });
  renderFestivals(); renderJobs(); renderBoards();
  if (location.hash === "#jobs") showTab("jobs");
})();
