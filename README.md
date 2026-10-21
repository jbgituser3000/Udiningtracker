# U Macros

A mobile web app for University of Utah students to track calories, protein, carbs and fat
using the real nutrition data from campus dining menus.

- **Menus**: pick a dining location and meal, tap a food, choose servings, add it to today.
- **Today**: daily totals against your goals; flip back to earlier days.
- **Custom**: log anything that isn't on a dining menu.
- **Goals**: set your daily calorie and macro targets.

Logs and goals are saved in the phone's browser. There are no accounts yet, so data doesn't sync between devices.

## Where the menu data comes from

U of U dining is run by Chartwells, which publishes menus and nutrition at
[dineoncampus.com/utah](https://dineoncampus.com/utah). The app reads that data on the server
(`src/lib/dineoncampus.ts`) and caches it for an hour. Dine On Campus has no official public API,
so if it changes, that one file is what needs fixing.

Check that the data source works:

```bash
npm run check-menu
```

It prints the dining locations and a sample item with its nutrients.

## Run it on your computer

1. Install [Node.js](https://nodejs.org) (version 20 or newer).
2. In this folder, run:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000. To see it at phone size, use your browser's device toolbar.

## Put it online (free)

1. Push this repo to GitHub.
2. Sign in at [vercel.com](https://vercel.com) with GitHub, click **Add New → Project**, pick this repo, click **Deploy**.
3. Every push to `main` redeploys automatically.

On an iPhone, open the site in Safari, tap Share → **Add to Home Screen** and it opens like an app.

## Project layout

```
src/app/page.tsx          Today screen
src/app/menu/page.tsx     Dining menu browser
src/app/add/page.tsx      Custom food form
src/app/goals/page.tsx    Goals form
src/app/api/              Server routes that fetch menus from Dine On Campus
src/lib/dineoncampus.ts   Reads and cleans up the Dine On Campus data
src/lib/storage.ts        Saves the log and goals in the browser
scripts/check-menu.mjs    Checks the live data source
```
