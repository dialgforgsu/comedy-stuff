// Job listings. region: "US" | "International" | "Remote".  type: Teaching | Production | Writing | Performing | Admin
// Listings go stale fast: keep `checked` current and delete anything that has closed.
window.JOBS = [
  {
    title: "Improv Instructor",
    org: "Upright Citizens Brigade",
    location: "New York, NY", region: "US",
    type: "Teaching", pay: null, schedule: "Part-time",
    notes: "Prefers UCB core curriculum completion and 2+ years of improv, comedy, or theatre experience.",
    url: "https://www.smartrecruiters.com/UprightCitizensBrigade1/743999879096973-ny-improv-instructor",
    checked: "2026-10-30"
  },
  {
    title: "Stand-up Instructor",
    org: "Upright Citizens Brigade",
    location: "Los Angeles, CA", region: "US",
    type: "Teaching", pay: "$60/hr", schedule: "Part-time",
    notes: "Link goes to UCB's job page; find the LA role there.",
    url: "https://www.ziprecruiter.com/co/Upright-Citizens-Brigade",
    checked: "2026-10-30"
  },
  {
    title: "Producer",
    org: "The People's Improv Theater (listing via Playbill)",
    location: "New York, NY", region: "US",
    type: "Production", pay: null, schedule: "Part-time",
    notes: "Supports improv, sketch and stand-up; works with comedians, students and independent producers on new shows.",
    url: "https://playbill.com/job/producer/84cddaba-fe72-4256-a75b-41e678e562dc",
    checked: "2026-10-30"
  },
  {
    title: "Comedy, Stand-Up & Improv Coach",
    org: "Polymer",
    location: "Remote", region: "Remote",
    type: "Teaching", pay: null, schedule: null,
    notes: "Posted July 15, 2026. Wants hands-on stand-up, improv or comedy-writing experience.",
    url: "https://jobs.8vc.com/companies/polymer-2-40f436d6-9d4b-4353-b2da-1694902b1148/jobs/86387286-comedy-stand-up-improv-coach",
    checked: "2026-10-30"
  }
];

// Places to keep looking. These are search pages, not single listings.
window.JOB_BOARDS = [
  { name: "ZipRecruiter: Improv jobs", region: "US", url: "https://www.ziprecruiter.com/Jobs/Improv" },
  { name: "ZipRecruiter: Comedy jobs", region: "US", url: "https://www.ziprecruiter.com/Jobs/Comedy" },
  { name: "UCB careers", region: "US", url: "https://www.smartrecruiters.com/UprightCitizensBrigade1" },
  { name: "Playbill job board", region: "US", url: "https://playbill.com/jobs" },
  { name: "Backstage", region: "US", url: "https://www.backstage.com/" },
  { name: "Indeed: improv instructor", region: "International", url: "https://www.indeed.com/jobs?q=improv+instructor" },
  { name: "Arts Jobs (UK)", region: "International", url: "https://www.artsjobs.org.uk/" },
  { name: "Mandy", region: "International", url: "https://www.mandy.com/" }
];
