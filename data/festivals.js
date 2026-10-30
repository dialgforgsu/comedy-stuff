// Festival listings. Dates are YYYY-MM-DD. Set a field to null when unknown.
//
// deadlines: ordered list of { label, date, fee }. The LAST one is treated as the final deadline.
// confirmed: true  = dates/fees seen on the festival's own page or a listing that matched it.
//            false = needs verifying; the site shows a "verify" badge.
// checked:   the date you last looked at the festival's site.
window.FESTIVALS = [
  {
    id: "steelstacks-2027",
    name: "SteelStacks Improv Comedy Festival",
    city: "Bethlehem, PA", country: "US",
    formats: ["Improv"],
    eventStart: "2027-01-22", eventEnd: "2027-01-24",
    submissionOpens: null,
    deadlines: [
      { label: "Early deadline", date: "2026-10-16", fee: "$15" },
      { label: "Final deadline", date: "2026-11-13", fee: "$25" }
    ],
    notes: "Hosted by ArtsQuest.",
    url: "https://www.artsquest.org/festivals/more-festivals-and-experiences/steelstacks-improv-comedy-festival/",
    confirmed: true, checked: "2026-10-30"
  },
  {
    id: "idaho-improvathon-2027",
    name: "Idaho Improvathon Festival",
    city: "Pocatello, ID", country: "US",
    formats: ["Improv"],
    eventStart: "2027-03-04", eventEnd: "2027-03-06",
    submissionOpens: "2026-10-01",
    deadlines: [{ label: "Performer submissions close", date: "2026-11-15", fee: null }],
    notes: "Improv only. Submit a 15–20 minute video.",
    url: "https://improvfestivals.org/festivals/idaho-improvathon-festival/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "mobile-carnival-2027",
    name: "Mobile Improv Comedy Carnival",
    city: "Mobile, AL", country: "US",
    formats: ["Improv"],
    eventStart: "2027-04-16", eventEnd: "2027-04-17",
    submissionOpens: null,
    deadlines: [{ label: "Submissions close", date: "2026-12-31", fee: null }],
    notes: "Short and long form welcome.",
    url: "https://improvfestivals.org/festivals/mobile-improv-comedy-carnival/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "playground-2027",
    name: "PlayGround Comedy Festival",
    city: "San Francisco, CA", country: "US",
    formats: ["Improv", "Sketch", "Mixed"],
    eventStart: "2027-03-12", eventEnd: "2027-04-04",
    submissionOpens: null,
    deadlines: [{ label: "Proposals due", date: "2026-10-31", fee: null }],
    notes: "Mixed-format, not improv-only. Selected projects pay a $600 facility fee.",
    url: "https://improvfestivals.org/festivals/playground-comedy-festival/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "nestival-2027",
    name: "The Nestival",
    city: "Columbus, OH", country: "US",
    formats: ["Improv"],
    eventStart: "2027-03-25", eventEnd: "2027-04-04",
    submissionOpens: "2026-10-01",
    deadlines: [{ label: "Applications close", date: "2027-01-08", fee: null }],
    notes: "Opening and closing dates are expected, not confirmed. Check the site.",
    url: "https://improvfestivals.org/festivals/the-nestival-festival/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "third-coast-2027",
    name: "Third Coast Improv Fest",
    city: "Nashville, TN", country: "US",
    formats: ["Improv"],
    eventStart: null, eventEnd: null,
    submissionOpens: "2026-12-01",
    deadlines: [],
    notes: "Site says submissions open Dec 1, 2026. Festival dates were inconsistent across sources, so none are shown.",
    url: "https://www.thirdcoastimprovfest.com/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "comedy-film-fest-2027",
    name: "The Comedy Film Festival",
    city: "Online / USA", country: "US",
    formats: ["Stand-up", "Sketch", "Film"],
    eventStart: "2027-05-14", eventEnd: "2027-05-16",
    submissionOpens: null,
    deadlines: [
      { label: "Extended deadline", date: "2027-01-31", fee: null },
      { label: "Final deadline", date: "2027-03-05", fee: null }
    ],
    notes: "Best for filmed stand-up specials (10–90 min). Live improv/sketch only if it plays as a complete show.",
    url: "https://filmfreeway.com/TheComedyFilmFestival",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "xl-festival-2027",
    name: "Happy Valley XL Improv Festival",
    city: "State College, PA", country: "US",
    formats: ["Improv"],
    eventStart: "2027-05-20", eventEnd: "2027-05-23",
    submissionOpens: null,
    deadlines: [],
    notes: "2027 deadline not confirmed. Last year: $25 early / $40 late, non-refundable.",
    url: "https://www.happyvalleyimprov.com/xlfest-submission-guidelines.html",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "wasatch-2027",
    name: "Wasatch Improv Festival",
    city: "West Jordan, UT", country: "US",
    formats: ["Improv"],
    eventStart: "2027-01-21", eventEnd: "2027-01-23",
    submissionOpens: null, deadlines: [],
    notes: "Listed as accepting submissions; deadline not published on the directory.",
    url: "https://improvfestivals.org/festivals/wasatch-improv-festival/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "nwif-2027",
    name: "Northwest Improv Fest",
    city: "Spokane, WA", country: "US",
    formats: ["Improv"],
    eventStart: "2027-04-15", eventEnd: "2027-04-17",
    submissionOpens: null, deadlines: [],
    notes: "Listed as accepting submissions; deadline not published on the directory.",
    url: "https://improvfestivals.org/festivals/northwest-improv-fest/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "hi-desert-2027",
    name: "Hi-Desert Comedy Campout",
    city: "Wonder Valley, CA", country: "US",
    formats: ["Mixed"],
    eventStart: "2027-04-16", eventEnd: "2027-04-17",
    submissionOpens: null, deadlines: [],
    notes: "Listed as accepting submissions; deadline not published on the directory.",
    url: "https://improvfestivals.org/festivals/hi-desert-comedy-campout/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "improv-festivus-2026",
    name: "Improv Festivus",
    city: "Richmond, VA", country: "US",
    formats: ["Improv"],
    eventStart: "2026-12-10", eventEnd: "2026-12-12",
    submissionOpens: null, deadlines: [],
    notes: "Listed as accepting submissions; deadline not published on the directory.",
    url: "https://improvfestivals.org/festivals/improv-festivus/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "edinburgh-2027",
    name: "Edinburgh International Improv Festival",
    city: "Edinburgh", country: "Scotland, UK",
    formats: ["Improv"],
    eventStart: "2027-02-04", eventEnd: "2027-02-07",
    submissionOpens: null,
    deadlines: [{ label: "Applications closed", date: "2026-09-06", fee: "Free" }],
    notes: "No fee to apply or perform. Box office split 70/30 in artists' favor.",
    url: "https://www.edimprovfest.com/apply",
    confirmed: true, checked: "2026-10-30"
  },
  {
    id: "liverpool-2027",
    name: "Liverpool Improvisation Festival",
    city: "Liverpool", country: "UK",
    formats: ["Improv"],
    eventStart: "2027-05-06", eventEnd: "2027-05-09",
    submissionOpens: null,
    deadlines: [
      { label: "Performer applications closed", date: "2026-09-12", fee: "Free" },
      { label: "Ensemble applications closed", date: "2026-10-13", fee: "Free" }
    ],
    notes: "No fee to apply. Same terms as Edinburgh.",
    url: "https://improvfestivals.org/festivals/liverpool-improvisation-festival/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "the-heat-2027",
    name: "The Heat: International Improv Showcase",
    city: "Vancouver, BC", country: "Canada",
    formats: ["Improv"],
    eventStart: "2027-01-26", eventEnd: "2027-01-31",
    submissionOpens: null,
    deadlines: [
      { label: "Round 1", date: "2026-06-15", fee: null },
      { label: "Round 2", date: "2026-07-06", fee: null }
    ],
    notes: "2027 application rounds have passed.",
    url: "https://improvfestivals.org/festivals/the-heat/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "helsinki-hifi-2027",
    name: "Helsinki International Festival of Improvisation (HiFi)",
    city: "Helsinki", country: "Finland",
    formats: ["Improv"],
    eventStart: "2027-05-26", eventEnd: "2027-05-29",
    submissionOpens: null, deadlines: [],
    notes: "Listed as accepting submissions; deadline not published on the directory.",
    url: "https://improvfestivals.org/festivals/helsinki-international-festival-of-improvisation/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "improvention-2026",
    name: "Improvention",
    city: "Canberra", country: "Australia",
    formats: ["Improv"],
    eventStart: "2026-12-07", eventEnd: "2026-12-13",
    submissionOpens: null, deadlines: [],
    notes: "Listed as accepting submissions; deadline not published on the directory.",
    url: "https://improvfestivals.org/festivals/improvention/",
    confirmed: false, checked: "2026-10-30"
  },
  {
    id: "vietnam-2027",
    name: "Vietnam Improv Festival",
    city: "Hanoi", country: "Vietnam",
    formats: ["Improv"],
    eventStart: "2027-04-24", eventEnd: "2027-05-02",
    submissionOpens: null, deadlines: [],
    notes: "Listed as accepting submissions; deadline not published on the directory.",
    url: "https://improvfestivals.org/festivals/vietnam-improv-festival/",
    confirmed: false, checked: "2026-10-30"
  }
];
