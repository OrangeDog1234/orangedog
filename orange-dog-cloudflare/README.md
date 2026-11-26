# Orange Dog – Cloudflare package

This zip has everything Cloudflare needs to run the website:

| File | What it is |
|---|---|
| `index.html` | The whole Orange Dog website. |
| `_worker.js` | A small Cloudflare **worker** that serves the website. It adds safety settings, makes sure everyone gets new updates straight away, opens the website even if someone types a wrong link, and (optional) keeps the voice-call relay password secret. Cloudflare only recognizes it with this exact name, including the `_` at the start. |
| `README.md` | This guide. The worker hides it, so visitors can't open it. |

---

## Put the website online (Cloudflare Pages, drag and drop)

### First time (new project)
1. Log in at **dash.cloudflare.com**.
2. Click **Workers & Pages**, then **Create**, then the **Pages** tab, then **Upload assets** (sometimes called "Drag and drop your files").
3. Type a project name (for example `orangedog`) and click **Create project**.
4. Drag **the zip file** (or the unzipped folder) onto the upload box.
5. Click **Deploy site**. Your site will be at `https://orangedog.pages.dev` (with your project name).

### Updating (you already have the project)
1. **Workers & Pages** → click your project.
2. Click **Create deployment** (or **Create new deployment**).
3. Drag the new zip in and click **Save and Deploy**.

The update shows up for everyone the next time they open or refresh the page.

> **Already using your own domain?** Nothing changes. Your domain keeps pointing to the same project.
>
> **Had a Google verification file?** If Google gave you a file like `googleXXXXXXXX.html`, put it next to `index.html` before zipping, so Google can still find it.

---

## Optional: hide the voice-call relay password

Right now the relay text you pasted into **Admin Abuse → Voice call relay** is saved where any player could find it. The worker can keep it secret:

1. In your Pages project go to **Settings → Variables and Secrets** (Production) and click **Add**.
2. Name: `METERED_URL`. Value: your Metered link that ends with `?apiKey=...` (Metered dashboard → TURN Server → your credential → the instructions/code example). Choose **Encrypt**, then save.
3. Deploy the zip again (Create deployment) so the worker gets the new setting.
4. On your website, open **Admin Abuse → Voice call relay**, paste `https://YOUR-SITE/api/ice` (your real website address + `/api/ice`) and press **Save relay**. It should say "Found … relay servers".

---

## Firebase check (for the "save points" that make it less laggy)

Your website packs old data into save files once a day while you (OrangeDog) are online. For this to free up space, Firebase must let the site delete old documents:

1. Open **console.firebase.google.com** → your project → **Firestore Database** → **Rules**.
2. If it says `allow read, write: if true;` (or `if request.time < ...` with a date in the future) you're fine.
3. If the date has already passed or it doesn't allow writes, the whole website stops saving, so update it.

You can see how packing went in **Admin Abuse → Save points (less lag)**.

---

## If something goes wrong
- **Blank page / old version:** refresh with **Ctrl+Shift+R** (Mac: **Cmd+Shift+R**).
- **"Orange Dog is having trouble loading":** Cloudflare had a hiccup; refresh in a minute.
- **Want to see what's slow on a device:** Settings → **Lag Meter** → turn it on and take a screenshot.
