# Wireframe inventory

These are structural wireframes, based on the current planner/admin routes and component responsibilities. They are not screenshots or pixel-perfect replicas. The same interactive dashboard renders desktop/mobile variants for the planner and CMS.

| Screen | Route | Desktop | Mobile | Key states |
|---|---|---|---|---|
| Trip planner | `/` | hero summary, left trip setup, central map, right results | hero summary, stacked settings/map/results and bottom navigation | empty route, calculated route, loading/error, login-required route actions, tutorial |
| Ads CMS | `/cms` | centered login/config form | full-width stacked form | setup missing, logged out, logged in, storage unavailable, disabled/enabled |
| Ads admin alias | `/admin/ads` | redirect | redirect | redirects to `/cms` |

Open `../HANDOVER_DASHBOARD.html` and select Wireframes; desktop/mobile toggle is interactive.
