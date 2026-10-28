# Project Structure

อัปเดต 28 ตุลาคม 2026 | ย่อเฉพาะไฟล์สำคัญจาก `rg --files src public`

```text
trip-planner/
├── AGENTS.md                    # Next.js agent rules + versioning obligations
├── CLAUDE.md                    # Claude Code entry; links to handover materials
├── HANDOVER.md                  # project handover summary
├── START_HERE_CLAUDE.md         # takeover prompt and first commands
├── DOCUMENT_INDEX.md            # document catalog
├── README.md                    # existing setup/project guide
├── package.json / package-lock.json
├── .env.example                 # variable names only; no values
├── public/road-hero.png         # hero asset
├── src/
│   ├── app/
│   │   ├── page.tsx, layout.tsx, globals.css, manifest.ts, icon.svg
│   │   ├── cms/page.tsx         # Ads CMS
│   │   ├── admin/ads/page.tsx   # redirect alias to /cms
│   │   └── api/                 # route handlers: places, details, routes, cloud, ads, admin
│   ├── components/              # planner, map panel, place search, tutorial, footer, ads
│   ├── data/place-types.ts      # category and connector choices
│   ├── lib/                     # API clients, schemas, maps, route, battery, auth, Redis
│   ├── types/trip.ts            # domain types
│   ├── proxy.ts                 # Auth0 middleware
│   └── version.ts               # reads package.json metadata
└── docs/handover/               # this handover package
```

Dependencies/build output (`node_modules`, `.next`, `.vercel`) are local/tooling artifacts, not handover source. `.env.local` is sensitive and excluded.
