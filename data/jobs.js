// Hand-listed jobs. Auto-pulled EntertainmentCareers.net jobs live in data/jobs.generated.js and are
// merged with these by title + employer, so listing the same job twice is harmless.
//
// region: "US" | "Remote" (non-US and restaurant roles are filtered out by the page).
// type:   Teaching | Production | Writing | Performing | Management | Marketing | Admin
// A job without a direct posting link gets a search link on its board (searchLink: true).
(function () {
  var CHECKED = "2026-10-30";
  var ZIP = "ZipRecruiter", IND = "Indeed", EC = "EntertainmentCareers.net";
  function q(s) { return encodeURIComponent(s).replace(/%20/g, "+"); }
  // Open the board's own search for this job, since the original posting link isn't known.
  function boardUrl(board, title, org, loc) {
    var place = /^Remote|^United States$/.test(loc) ? "" : loc.replace(/\s*\(.*\)/, "");
    var term = title.replace(/\s*\(.*\)/, "") + " " + org;
    if (board === IND) return "https://www.indeed.com/jobs?q=" + q(term) + (place ? "&l=" + q(place) : "");
    if (board === ZIP) return "https://www.ziprecruiter.com/jobs-search?search=" + q(term) + (place ? "&location=" + q(place) : "");
    return "https://www.entertainmentcareers.net/";
  }
  // J(title, org, location, type, pay, posted, board, directUrl, schedule, notes)
  function J(title, org, loc, type, pay, posted, board, url, schedule, notes) {
    return {
      title: title, org: org, location: loc, region: /^Remote/.test(loc) ? "Remote" : "US", type: type,
      pay: pay, schedule: schedule || null, notes: notes || null, posted: posted ? "2026-" + posted : null,
      url: url || boardUrl(board, title, org, loc), searchLink: !url, source: board, checked: CHECKED
    };
  }
  var ECU = function (slug) { return "https://www.entertainmentcareers.net/" + slug + "/"; };

  window.JOBS = [
    // --- direct postings ---
    {
      title: "Improv Instructor", org: "Upright Citizens Brigade", location: "New York, NY", region: "US",
      type: "Teaching", pay: null, schedule: "Part-time", posted: null,
      notes: "Prefers UCB core curriculum completion and 2+ years of improv, comedy, or theatre experience.",
      url: "https://www.smartrecruiters.com/UprightCitizensBrigade1/743999879096973-ny-improv-instructor",
      source: "UCB careers", checked: CHECKED
    },
    {
      title: "Producer", org: "The People's Improv Theater", location: "New York, NY", region: "US",
      type: "Production", pay: null, schedule: "Part-time", posted: null,
      notes: "Supports improv, sketch and stand-up; works with comedians, students and independent producers on new shows.",
      url: "https://playbill.com/job/producer/84cddaba-fe72-4256-a75b-41e678e562dc",
      source: "Playbill", checked: CHECKED
    },

    // --- EntertainmentCareers.net (direct links where found) ---
    J("Director of Live Events", "MSG Entertainment", "New York, NY", "Production", null, "10-22", EC, ECU("msg-entertainment/director-of-live-events/job/534738")),
    J("Artistic Director", "Confidential (via staffing firm)", "New York, NY", "Management", null, "10-20", EC, ECU("confidential/artistic-director/job/534558")),
    J("Manager, Netflix Is a Joke Social Marketing", "Netflix", "Los Angeles, CA", "Marketing", null, "10-19", EC, ECU("netflix/manager-netflix-is-a-joke-social-marketing/job/531460")),
    J("Comedy Videographer and Script Writer", "Reilly Talent", "Los Angeles, CA", "Writing", null, "10-18", EC, ECU("reilly-talent/comedy-videographer-and-script-writer/job/534430"), "Part-time"),
    J("Booking Director", "MSG Entertainment", "New York, NY", "Production", null, "10-14", EC, ECU("msg-entertainment/booking-director/job/534156")),
    J("Director, Dry Bar Comedy", "Angel Studios", "Provo, UT", "Management", null, "10-12", EC, ECU("angel-studios/director-dry-bar-comedy/job/531193")),
    J("Operations Supervisor", "Cobb's Comedy", "San Francisco, CA", "Management", null, "10-12", EC, ECU("cobb-s-comedy/operations-supervisor/job/524591")),
    J("Executive Assistant, Comedy Programming", "HBO", "Culver City, CA", "Admin", null, "10-09", EC),
    J("Content & Creative Producer", "Levity Live", "West Hollywood, CA", "Production", "$90K–$100K/yr", "10-07", EC, ECU("levity-live/content-and-creative-producer/job/533630")),
    J("Content & Creative Strategy Assistant", "Levity Live", "West Hollywood, CA", "Admin", null, "10-07", EC),
    J("Comedy Tour Marketing Director", "Live Nation", "Beverly Hills, CA", "Marketing", null, "10-05", EC, ECU("livenation/comedy-tour-marketing-director/job/533419")),
    J("Music and Comedy Booking Assistant", "CAA", "Los Angeles, CA", "Admin", null, "10-05", EC, ECU("caa/music-and-comedy-booking-assistant/job/515159")),
    J("Communications Manager – Nonfiction and Standup", "Netflix", "Los Angeles, CA", "Marketing", null, "10-05", EC, ECU("netflix/communications-manager-nonfiction-and-standup/job/530690")),
    J("Comedy Touring Agent Trainee", "United Talent Agency", "Los Angeles, CA", "Admin", null, "10-01", EC),
    J("Executive Assistant, Music and Comedy Touring", "CAA", "Nashville, TN", "Admin", null, "09-21", EC, ECU("caa/executive-assistant-in-music-and-comedy-touring/job/529498")),

    // --- ZipRecruiter ---
    J("Comedy, Stand-Up & Improv Coach", "Leland", "Remote (US)", "Teaching", "~$18–$24/hr (est.)", "10-13", ZIP),
    J("Improv Instructor – Pittsburgh", "Upright Citizens Brigade", "Pittsburgh, PA", "Teaching", "~$55K–$72K/yr (est.)", "10-03", ZIP),
    J("Improv & Voice Actors, Paid AI Research Study", "HumanSignal", "Raleigh, NC", "Performing", "$50–$100/hr", null, ZIP),
    J("Paid Improv and Acting Work (AI research)", "HumanSignal", "Columbus, OH", "Performing", "$200/hr", null, ZIP),
    J("Improv and Comedy Instructor", "Athletes Global", "Lemoyne, PA", "Teaching", "$25–$30/hr", null, ZIP),
    J("Stand-Up Comedy Instructor", "Upright Citizens Brigade", "Los Angeles, CA", "Teaching", "$60/hr", null, ZIP, null, "Part-time"),
    J("Freelance Content Producer – NY", "Upright Citizens Brigade", "New York, NY", "Production", null, null, ZIP),
    J("General Manager", "Raleigh Improv", "Cary, NC", "Management", "$80K–$90K/yr", null, ZIP),
    J("Comedy Touring Floater", "The Gersh Agency", "Beverly Hills, CA", "Admin", "$21/hr", null, ZIP),
    J("Comedy Touring Assistant", "CAA", "Los Angeles, CA", "Admin", "$20–$22/hr", null, ZIP),
    J("Comedy Enrichment Instructor", "ChalkSense", "Millburn, NJ", "Teaching", "$20–$30/hr", null, ZIP, null, "Hourly"),

    // --- Indeed ---
    J("Paid Creative Strategist (w/ a Sense of Humor)", "Shinesty", "Austin, TX (hybrid)", "Marketing", "$90K–$110K/yr", null, IND),
    J("Seasonal Content Creator", "SXSW", "Austin, TX", "Marketing", null, null, IND),
    J("Teaching Artist: Musical Theater & Acting", "Zach Theatre", "Cedar Park, TX", "Teaching", null, null, IND, null, "Contract"),
    J("Actor", "Thirteenth Floor Entertainment Group", "Austin, TX", "Performing", null, null, IND),
    J("Improv Performer (Dinner Detective)", "Nine9", "United States", "Performing", null, null, IND),
    J("Improv Club (after-school)", "Cambridge Public Schools", "Cambridge, MA", "Teaching", null, null, IND),
    J("Improv and Comedy Instructor", "Athletes Global", "Columbus, OH", "Teaching", "$25–$30/hr", null, IND),
    J("Actor/Facilitator", "CUNY Research Foundation", "New York, NY", "Performing", "$50/hr", null, IND),
    J("Trivia & Games Event Host", "CourseHorse", "New York, NY (hybrid)", "Performing", "$40–$70/hr", null, IND)
  ];

  // Search links (US only). Indeed and ZipRecruiter forbid automated collection, so these open a
  // pre-filtered search on their sites instead of being scraped. Jobs from EntertainmentCareers.net
  // are pulled automatically into data/jobs.generated.js by `npm run update`.
  window.JOB_BOARDS = [
    { name: "Indeed: improv", region: "United States", url: "https://www.indeed.com/jobs?q=improv&l=United+States" },
    { name: "Indeed: comedy writer / producer", region: "United States", url: "https://www.indeed.com/jobs?q=comedy+writer+OR+comedy+producer&l=United+States" },
    { name: "ZipRecruiter: improv", region: "United States", url: "https://www.ziprecruiter.com/Jobs/Improv" },
    { name: "ZipRecruiter: comedy", region: "United States", url: "https://www.ziprecruiter.com/Jobs/Comedy" },
    { name: "EntertainmentCareers.net", region: "United States", url: "https://www.entertainmentcareers.net/" },
    { name: "UCB careers", region: "United States", url: "https://www.smartrecruiters.com/UprightCitizensBrigade1" },
    { name: "Playbill job board", region: "United States", url: "https://playbill.com/jobs" },
    { name: "Backstage", region: "United States", url: "https://www.backstage.com/" }
  ];
})();
