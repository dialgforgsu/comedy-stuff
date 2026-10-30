# Improv Fest & Jobs Board

A static site (no build step) listing improv/comedy festivals with submission deadlines, fees and dates, plus US comedy jobs. Visitors can add deadline reminders and event dates to Google Calendar or Apple/Outlook (.ics download).

## Where the data comes from

| Data | Source | How |
| --- | --- | --- |
| Festivals | [improvfestivals.org](https://improvfestivals.org) public JSON feed (CC BY-SA 4.0, attribution is in the footer) | automatic |
| Festivals | [crowdwork.com/festivals](https://www.crowdwork.com/festivals) | **blocked, see below** |
| Festivals | Each festival's own site: deadline and "submission fee" hints | automatic |
| Festivals | `data/festivals.js` | hand edits |
| Jobs | [EntertainmentCareers.net](https://www.entertainmentcareers.net) public job sitemap, filtered to comedy-related, US-only, no restaurant roles | automatic |
| Jobs | Indeed, ZipRecruiter | **search links only, see below** |
| Jobs | `data/jobs.js` | hand edits |

A festival is marked **Verify** unless two independent sources agree on its final deadline (or you set `confirmed` in `data/festivals.js`).

### What is not pulled automatically, and why

- **Indeed and ZipRecruiter** prohibit automated collection in their terms, and ZipRecruiter returns 403 to scripts. They appear as US-filtered search links instead. If you want their listings in the page, both have partner/advertiser programs with official feeds.
- **CrowdWork** returns 403 to the updater script. The code for it is in `scripts/update.mjs` and is skipped gracefully when blocked. Ask CrowdWork for permission or a feed, or add their festivals by hand.
- **Other sources** (FilmFreeway, Facebook groups, newsletters) block scripts or forbid scraping. Add them by hand in `data/festivals.js`.

## Refresh the data

```
npm install
npm run update            # festivals + jobs   (~1-2 min; polite delays between requests)
npm run update festivals  # or: npm run update jobs
```

This writes `data/festivals.generated.js` and `data/jobs.generated.js`. Don't edit those; they're overwritten. A GitHub Action (`.github/workflows/update-data.yml`) does this daily and commits the result. You can also trigger it from the repo's **Actions** tab.

## Edit by hand

| File | What it holds |
| --- | --- |
| `data/festivals.js` | Festival entries. Fills gaps the feeds leave; add `override: true` to make your values win. |
| `data/jobs.js` | Hand-picked jobs and the job-board search links. |
| `data/config.js` | Site name, "Submit a listing" link, reminder lead time. |

## Calendar feed

`festivals.ics` is rebuilt by the daily Action (`npm run feed`) and holds every upcoming deadline and event date. Visitors subscribe from the "Every deadline in your calendar" links, and their calendar keeps itself current. `siteUrl` in `data/config.js` must match your Pages URL.

## Biweekly email digest

Signup uses [Buttondown](https://buttondown.com) (free for small lists). The site never touches email addresses: the form posts straight to Buttondown, which does double opt-in (confirmation email) and adds an unsubscribe link to every message.

1. Create a Buttondown account and put your username in `newsletterUsername` in `data/config.js`. Until then the signup box stays hidden.
2. In Buttondown, create an API key and add it to the repo as the secret `BUTTONDOWN_API_KEY` (Settings, Secrets and variables, Actions).
3. `.github/workflows/biweekly-digest.yml` runs on even ISO weeks, builds the digest (deadlines in the next 14 days, new festivals, new jobs) and creates a **draft** in Buttondown. You review and send it; nothing goes out automatically. Preview any time with `npm run digest -- --dry-run`.

## Security notes

- A Content-Security-Policy meta tag in `index.html` blocks inline and third-party scripts and limits form posts to buttondown.com. Keep scripts as files in this repo.
- All page text is inserted with `textContent`, never `innerHTML`, so feed data can't inject markup.
- No secrets live in the repo. The API key is a GitHub Actions secret used only by the digest workflow, and the digest strips markdown and non-https links from feed text before it becomes an email.
- Saved festivals and the theme are stored only in the visitor's own browser.

## Preview locally

Open `index.html` directly, or run `python -m http.server` in this folder.

## Publish on GitHub Pages

Repo **Settings → Pages**, source **Deploy from a branch**, branch `main`, folder `/ (root)`.
