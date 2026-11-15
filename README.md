# ALPHA Lua Text Publisher

A small, responsive static site for publishing Lua source as **plain text**. Netlify Functions validate uploads, Netlify Blobs stores the original text, and each publication receives a unique `/s/<uuid>` URL. Published content is returned with `Content-Type: text/plain` and `X-Content-Type-Options: nosniff`.

**Submitted scripts are never parsed, compiled, or executed.** This project intentionally creates no executable loadstring wrapper. Anyone with a published URL can read its contents, so publish only material you are authorized to share.

## Project contents

- `index.html` — responsive editor, `.lua`/`.txt` file upload, publish, and copy-URL interface.
- `netlify/functions/scripts.mjs` — validates and saves script text to Netlify Blobs, then returns its unique URL.
- `netlify/functions/script.mjs` — serves a stored script as plain text.
- `netlify.toml` — configures the static site, Functions, and `/s/:id` URL rewrite.

## Deploy on Netlify

1. Push this repository to GitHub and sign in to [Netlify](https://app.netlify.com/).
2. Choose **Add new site → Import an existing project** and select this repository.
3. Use the build settings in `netlify.toml` (publish directory `.` and build command `npm run build`). Netlify installs dependencies from `package.json`.
4. Deploy the site. Netlify Blobs is available to Functions in the deployed Netlify environment; no separate bucket setup or credentials are required for the standard site-scoped store.
5. Open the deployed site, paste or upload a Lua text file (up to 200 KB), choose **PUBLISH & GET URL**, and copy its direct text URL.

## Local development

Requires Node.js 20 or newer. From the project directory:

```sh
npm install
npx netlify dev
```

The local Netlify CLI runs the static site and Functions. For local Blob access, Netlify CLI may require linking the local folder to a Netlify site (`npx netlify link`) so it can use the site's development credentials and environment.

## Limits and privacy

- Maximum input size: 200 KiB, enforced in both browser and Function.
- A direct URL is public to anyone who obtains it; this app does not provide authentication, deletion, or moderation.
- Storage availability and retention follow Netlify Blobs and the connected Netlify site's configuration.
- The service stores source text only and does not guarantee compatibility with any Lua runtime.
