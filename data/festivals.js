// Hand-edited festival entries. `npm run update` merges these with the automatic feeds
// (improvfestivals.org, CrowdWork, festival sites) into data/festivals.generated.js.
//
// Matching is by festival name. By default a curated field only FILLS GAPS left by the feeds.
// Add `override: true` to make your values win (use it when you've checked the festival's own page).
// Dates are YYYY-MM-DD; use null when unknown. deadlines: [{ label, date, fee }], last one = final deadline.
window.FESTIVALS = [
  {
    id: "steelstacks-2027", override: true,
    name: "SteelStacks Improv Comedy Festival",
    city: "Bethlehem, PA", country: "US", formats: ["Improv"],
    eventStart: "2027-01-22", eventEnd: "2027-01-24",
    deadlines: [
      { label: "Early deadline", date: "2026-10-16", fee: "$15" },
      { label: "Final deadline", date: "2026-11-13", fee: "$25" }
    ],
    notes: "Hosted by ArtsQuest.",
    url: "https://www.artsquest.org/festivals/more-festivals-and-experiences/steelstacks-improv-comedy-festival/",
    confirmed: true, checked: "2026-10-30"
  },
  {
    id: "edinburgh-2027", override: true,
    name: "Edinburgh International Improv Festival",
    city: "Edinburgh", country: "Scotland, UK", formats: ["Improv"],
    eventStart: "2027-02-04", eventEnd: "2027-02-07",
    deadlines: [{ label: "Applications closed", date: "2026-09-06", fee: "Free" }],
    notes: "No fee to apply or perform. Box office split 70/30 in artists' favor.",
    url: "https://www.edimprovfest.com/apply",
    confirmed: true, checked: "2026-10-30"
  },
  {
    id: "playground-2027",
    name: "PlayGround Comedy Festival",
    city: "San Francisco, CA", country: "US", formats: ["Improv", "Sketch"],
    notes: "Mixed-format, not improv-only. Selected projects pay a $600 facility fee.",
    url: "https://improvfestivals.org/festivals/playground-comedy-festival/"
  },
  {
    id: "idaho-improvathon-2027",
    name: "Idaho Improvathon Festival",
    city: "Pocatello, ID", country: "US", formats: ["Improv"],
    notes: "Improv only. Submit a 15–20 minute video.",
    url: "https://improvfestivals.org/festivals/idaho-improvathon-festival/"
  },
  {
    id: "xl-festival-2027",
    name: "Happy Valley XL Improv Festival",
    city: "State College, PA", country: "US", formats: ["Improv"],
    notes: "Last year's fee was $25 early / $40 late, non-refundable.",
    url: "https://www.happyvalleyimprov.com/xlfest-submission-guidelines.html"
  },
  {
    id: "phit-phest-2026", override: true,
    name: "PHIT PHEST",
    city: "Philadelphia, PA", country: "US", formats: ["Improv"],
    deadlines: [{ label: "Submissions closed", date: "2026-10-23", fee: null }],
    notes: "Submission deadline was Oct 23, 2026 at noon. Accepted acts are paid $60 per act/team. No submission fee listed.",
    url: "https://phillyimprovtheater.com/",
    confirmed: true, checked: "2026-10-30"
  },
  {
    id: "last-word-2027", override: true,
    name: "The Last Word Comedy Festival",
    city: "Williamsburg, VA", country: "US", formats: ["Improv", "Stand-up"],
    deadlines: [
      { label: "Early bird", date: "2026-10-28", fee: "$20 improv / $15 stand-up" },
      { label: "Final deadline", date: "2026-11-11", fee: "$25 improv / $20 stand-up" }
    ],
    notes: "Apply via the form on their submit page (video of a past performance). Use code COLLEGE to waive the fee for college groups. Their page gives conflicting early-bird dates (Oct 26 vs Oct 28), so confirm the cutoff.",
    url: "https://www.lastwordfestival.com/submit",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "comedy-film-fest-2027",
    name: "The Comedy Film Festival",
    city: "Online / USA", country: "US", formats: ["Stand-up", "Sketch", "Film"],
    eventStart: "2027-05-14", eventEnd: "2027-05-16",
    deadlines: [
      { label: "Extended deadline", date: "2027-01-31", fee: null },
      { label: "Final deadline", date: "2027-03-05", fee: null }
    ],
    notes: "Best for filmed stand-up specials (10–90 min). Live improv/sketch only if it plays as a complete show.",
    url: "https://filmfreeway.com/TheComedyFilmFestival",
    confirmed: false, checked: "2026-10-30"
  }
];
