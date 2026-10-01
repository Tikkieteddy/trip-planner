<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## App Versioning

- Keep the app version and build identifier together in `package.json` as the single source of truth. `src/version.ts` may expose that metadata to the UI; do not duplicate version literals in components.
- For every project change, classify the release: new backward-compatible features increment MINOR and reset PATCH to 0; bug fixes and small improvements increment PATCH; breaking changes increment MAJOR and reset MINOR and PATCH to 0.
- Update the root package version in `package-lock.json` whenever the semantic version changes. Do not increment the semantic version for a build-only update.
- On every change, update `package.json`'s `build` using the `Asia/Bangkok` calendar date in `YYYYMMDD.N` format. Increment N by 1 for another change on the same date; reset N to 1 on a new Bangkok date.
- Render the copyright from 2026 through the current year, using JavaScript `new Date().getFullYear()` after the page opens; use `© 2026` through 2026 and `© 2026-CURRENT_YEAR` afterward.
- The shared footer displays only `V.MAJOR`. Hover and keyboard focus, as well as a tap on touch devices, must reveal a dismissible custom tooltip with `V.MAJOR.MINOR.PATCH+YYYYMMDD.N`. Do not rely on the `title` attribute.
- Keep the shared footer in the root layout so it appears on every page. Use `ttdLab` as the credit name.
- After changing the version or footer, verify the displayed year, short version, full tooltip value, lint, and production build.
