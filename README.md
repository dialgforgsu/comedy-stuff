# Improv Fest & Jobs Board

A static site (no build step) listing improv/comedy festivals with submission deadlines, fees and dates, plus a comedy jobs section. Visitors can add deadline reminders and event dates to Google Calendar or Apple/Outlook (.ics download).

## Edit the content

| File | What it holds |
| --- | --- |
| `data/festivals.js` | Festival listings. Set `confirmed: true` once you've checked the festival's own page. |
| `data/jobs.js` | Job listings and the "keep searching" job boards. |
| `data/config.js` | Site name, Google Analytics ID, "Submit a listing" link, reminder lead time. |

## Turn on Google Analytics

1. In Google Analytics, create a GA4 property and a **Web** data stream for your Pages URL.
2. Copy the Measurement ID (`G-XXXXXXXXXX`) into `gaMeasurementId` in `data/config.js`.
3. See visitor sources under **Reports → Acquisition → Traffic acquisition**; countries under **Demographics → Demographic details**.

The site also sends events for calendar adds and outbound festival/job clicks.

If you expect EU/UK visitors, consider adding a cookie-consent banner.

## Preview locally

Open `index.html` directly, or run `python -m http.server` in this folder.

## Publish on GitHub Pages

1. Push this repo to GitHub.
2. Repo **Settings → Pages**, source **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site goes live at `https://YOUR-USER.github.io/REPO-NAME/`.
